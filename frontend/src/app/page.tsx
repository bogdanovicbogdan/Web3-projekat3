"use client";

import React, { useState, useCallback, useEffect } from "react";
import { formatUnits, parseUnits, keccak256, toUtf8Bytes, JsonRpcProvider } from "ethers";
import { Navbar } from "@/components/Navbar";
import { CfoDashboard } from "@/components/CfoDashboard";
import { EmployeePortal } from "@/components/EmployeePortal";
import { useWallet } from "@/lib/useWallet";
import { CONTRACT_ADDRESSES, NETWORK } from "@/lib/contracts";

export default function Home() {
    const [activeTab, setActiveTab] = useState<"cfo" | "employee">("cfo");
    const [isWarping, setIsWarping] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [txError, setTxError] = useState<string>("");

    const { address, provider, error, isConnecting, connect, getVaultContract, getUsdcContract } = useWallet();

    // Stvarno stanje ugovora - popunjava se citanjem sa blockchain-a, ne rucno
    const [vaultStats, setVaultStats] = useState({
        totalPrincipal: 0,
        liquidBuffer: 0,
        strategyAssets: 0,
        totalYield: 0,
        apyBps: 0,
        strategyName: "",
        companyShareBps: 5000,
    });

    const [employeeSalary, setEmployeeSalary] = useState<number>(0);
    const [employeeYieldShare, setEmployeeYieldShare] = useState<number>(0);

    // Cita trenutno stanje sa ugovora - poziva se posle konekcije i posle svake transakcije
    const refreshData = useCallback(async () => {
        const vault = getVaultContract();
        if (!vault || !address) return;

        setIsLoading(true);
        try {
            const stats = await vault.getVaultStats();
            const companyShareBps = await vault.companyYieldShareBps();

            setVaultStats({
                totalPrincipal: Number(formatUnits(stats[0], 6)),
                liquidBuffer: Number(formatUnits(stats[1], 6)),
                strategyAssets: Number(formatUnits(stats[2], 6)),
                totalYield: Number(formatUnits(stats[3], 6)),
                apyBps: Number(stats[4]),
                strategyName: stats[5],
                companyShareBps: Number(companyShareBps),
            });

            const empBal = await vault.getEmployeeEncryptedBalance(address);
            setEmployeeSalary(Number(formatUnits(empBal[2], 6)));
            setEmployeeYieldShare(Number(formatUnits(empBal[3], 6)));
        } catch (e: any) {
            console.error("Greska pri citanju sa ugovora:", e);
            setTxError(e?.message || "Nije moguce ucitati podatke sa ugovora");
        } finally {
            setIsLoading(false);
        }
    }, [getVaultContract, address]);

    useEffect(() => {
        if (address) refreshData();
    }, [address, refreshData]);

    // Vreme se pomera direktno na Hardhat cvoru - MetaMask ne prosledjuje admin RPC komande,
    // pa se za ovaj jedan poziv koristi direktna konekcija na cvor (bez MetaMask posrednika)
    const handleTimeWarp = async (days: number) => {
        setIsWarping(true);
        setTxError("");
        try {
            const nodeProvider = new JsonRpcProvider(NETWORK.rpcUrl);
            await nodeProvider.send("evm_increaseTime", [days * 24 * 60 * 60]);
            await nodeProvider.send("evm_mine", []);

            const vault = getVaultContract();
            if (vault) {
                const tx = await vault.harvestYield();
                await tx.wait();
            }
            await refreshData();
        } catch (e: any) {
            setTxError(e?.message || "Time-warp nije uspeo");
        } finally {
            setIsWarping(false);
        }
    };

    // Strategy switcher - ostaje simuliran, jer ugovor trenutno ima samo jednu deployed strategiju
    const handleStrategyChange = (name: string, apyBps: number) => {
        setVaultStats((prev) => ({ ...prev, strategyName: name, apyBps }));
    };

    const handleYieldSplitChange = async (companyShareBps: number) => {
        const vault = getVaultContract();
        if (!vault) return;
        try {
            const tx = await vault.setYieldSplit(companyShareBps);
            await tx.wait();
            await refreshData();
        } catch (e: any) {
            setTxError(e?.message || "Izmena raspodele prinosa nije uspela");
        }
    };

    // Stvarni batch deposit: approve ukupnog USDC iznosa, pa depositPayrollBatch na ugovoru za sve radnike
    const handleDepositBatchPayroll = async (recipients: string[], amounts: number[]) => {
        const vault = getVaultContract();
        const usdc = getUsdcContract();
        const totalAmount = amounts.reduce((sum, a) => sum + a, 0);

        if (!vault || !usdc) {
            // Simulirani fallback kada wallet nije konektovan
            setVaultStats((prev) => ({
                ...prev,
                totalPrincipal: prev.totalPrincipal + totalAmount,
                liquidBuffer: prev.liquidBuffer + totalAmount * 0.15,
                strategyAssets: prev.strategyAssets + totalAmount * 0.85,
            }));
            return;
        }

        setTxError("");
        try {
            const totalUnits = parseUnits(totalAmount.toString(), 6);

            const approveTx = await usdc.approve(CONTRACT_ADDRESSES.vault, totalUnits);
            await approveTx.wait();

            const amountUnitsArray = amounts.map((a) => parseUnits(a.toString(), 6));
            const fakeHandles = recipients.map((r, i) => keccak256(toUtf8Bytes(`${r}-${amounts[i]}-${Date.now()}`)));

            const depositTx = await vault.depositPayrollBatch(recipients, fakeHandles, amountUnitsArray);
            await depositTx.wait();

            await refreshData();
        } catch (e: any) {
            setTxError(e?.message || "Batch deposit nije uspeo");
        }
    };

    // Stvarni claim - poziva ugovor sa nalogom trenutno povezanim u MetaMask-u
    const handleClaimSalary = async (amount: number) => {
        const vault = getVaultContract();
        if (!vault) return;
        setTxError("");
        try {
            const amountUnits = parseUnits(amount.toString(), 6);
            const tx = await vault.claimSalary(amountUnits);
            await tx.wait();
            await refreshData();
        } catch (e: any) {
            setTxError(e?.message || "Claim nije uspeo");
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>

            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                address={address}
                isConnecting={isConnecting}
                onConnect={connect}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-8 relative z-10">
                {!address && (
                    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 text-center mb-6">
                        <p className="text-slate-300 text-sm">
                            Poveži MetaMask (na lokalnu Hardhat mrežu, chain ID 31337) da vidiš stvarno stanje ugovora.
                        </p>
                    </div>
                )}

                {(error || txError) && (
                    <div className="glass-panel p-4 rounded-xl border border-red-500/30 text-red-300 text-xs mb-6">
                        {error || txError}
                    </div>
                )}

                {isLoading && (
                    <div className="text-center text-slate-400 text-xs mb-4">Učitavanje stanja sa ugovora...</div>
                )}

                {activeTab === "cfo" ? (
                    <CfoDashboard
                        vaultStats={vaultStats}
                        onTimeWarp={handleTimeWarp}
                        onStrategyChange={handleStrategyChange}
                        onYieldSplitChange={handleYieldSplitChange}
                        onDepositBatchPayroll={handleDepositBatchPayroll}
                        isWarping={isWarping}
                    />
                ) : (
                    <EmployeePortal
                        employeeSalary={employeeSalary}
                        employeeYieldShare={employeeYieldShare}
                        onClaimSalary={handleClaimSalary}
                        liquidBuffer={vaultStats.liquidBuffer}
                    />
                )}
            </main>

            <footer className="glass-panel border-t border-slate-800/80 py-6 px-4 mt-auto text-center text-xs text-slate-400">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span>YieldRoll FHE • Povezano na lokalnu Hardhat mrežu</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}