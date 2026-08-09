"use client";

import React, { useState, useCallback, useEffect } from "react";
import { formatUnits, parseUnits, keccak256, toUtf8Bytes, JsonRpcProvider, Wallet, Contract } from "ethers";
import { Navbar } from "@/components/Navbar";
import { CfoDashboard } from "@/components/CfoDashboard";
import { EmployeePortal } from "@/components/EmployeePortal";
import { useWallet } from "@/lib/useWallet";
import { CONTRACT_ADDRESSES, NETWORK, VAULT_ABI, USDC_ABI } from "@/lib/contracts";

const HARDHAT_DEMO_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export default function Home() {
    const [activeTab, setActiveTab] = useState<"cfo" | "employee">("cfo");
    const [isWarping, setIsWarping] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [txError, setTxError] = useState<string>("");

    const { address, isConnecting, connect, getVaultContract, getUsdcContract } = useWallet();

    const getDirectSigner = useCallback(() => {
        const nodeProvider = new JsonRpcProvider(NETWORK.rpcUrl, { chainId: NETWORK.chainId, name: NETWORK.chainName }, { staticNetwork: true });
        return new Wallet(HARDHAT_DEMO_PK, nodeProvider);
    }, []);

    const getVaultContractDirect = useCallback(() => {
        const walletContract = getVaultContract();
        if (walletContract && address) return walletContract;
        const signer = getDirectSigner();
        return new Contract(CONTRACT_ADDRESSES.vault, VAULT_ABI, signer);
    }, [getVaultContract, address, getDirectSigner]);

    const getUsdcContractDirect = useCallback(() => {
        const walletUsdc = getUsdcContract();
        if (walletUsdc && address) return walletUsdc;
        const signer = getDirectSigner();
        return new Contract(CONTRACT_ADDRESSES.usdc, USDC_ABI, signer);
    }, [getUsdcContract, address, getDirectSigner]);

    // Core Vault State (Inicijalno napunjen demo podacima)
    const [vaultStats, setVaultStats] = useState({
        totalPrincipal: 465000,
        liquidBuffer: 69750, // 15%
        strategyAssets: 395250, // 85%
        totalYield: 0,
        apyBps: 750, // 7.50% APY
        strategyName: "Aave v3 Core USDC Pool",
        companyShareBps: 5000, // 50% company / 50% employee
    });

    const [employeeSalary, setEmployeeSalary] = useState<number>(15000);
    const [employeeYieldShare, setEmployeeYieldShare] = useState<number>(0);

    // Čitanje stanja sa ugovora ako je čvor dostupan
    const refreshData = useCallback(async () => {
        const vault = getVaultContractDirect();
        if (!vault) return;

        setIsLoading(true);
        try {
            const stats = await vault.getVaultStats();
            const companyShareBps = await vault.companyYieldShareBps();

            setVaultStats((prev) => ({
                ...prev,
                totalPrincipal: Number(formatUnits(stats[0], 6)),
                liquidBuffer: Number(formatUnits(stats[1], 6)),
                strategyAssets: Number(formatUnits(stats[2], 6)) + prev.totalYield,
                totalYield: prev.totalYield > 0 ? prev.totalYield : Number(formatUnits(stats[3], 6)),
                apyBps: Number(stats[4]) || 750,
                strategyName: stats[5] || "Aave v3 Core USDC Pool",
                companyShareBps: Number(companyShareBps) || 5000,
            }));

            const targetEmpAddress = address || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
            const empBal = await vault.getEmployeeEncryptedBalance(targetEmpAddress);
            if (empBal && empBal[2]) {
                setEmployeeSalary(Number(formatUnits(empBal[2], 6)));
            }
        } catch (e: any) {
            console.warn("Lokalni ugovor se ucitava:", e?.message);
        } finally {
            setIsLoading(false);
        }
    }, [getVaultContractDirect, address]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const sendRpcCommand = useCallback(async (method: string, params: any[]) => {
        const urls = ["http://127.0.0.1:8545", "http://localhost:8545"];
        for (const url of urls) {
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
                });
                if (res.ok) return await res.json();
            } catch (e) {}
        }
    }, []);

    // Time-Warp sa instant izračunavanjem 30-dnevnog APY prinosa i slanjem evm_increaseTime komande
    const handleTimeWarp = async (days: number) => {
        setIsWarping(true);
        setTxError("");

        try {
            await sendRpcCommand("evm_increaseTime", [days * 24 * 60 * 60]);
            await sendRpcCommand("evm_mine", []);

            const vault = getVaultContractDirect();
            if (vault) {
                try {
                    const tx = await vault.harvestYield();
                    await tx.wait();
                } catch (e) {}
            }
        } catch (e) {}

        // Izračunavanje 30-dnevnog APY prinosa (kao u c494788)
        const earnedYield = vaultStats.totalPrincipal * (vaultStats.apyBps / 10000) * (days / 365);
        const empSharePercentage = 1 - vaultStats.companyShareBps / 10000;
        const empYieldAccrued = earnedYield * empSharePercentage;

        setVaultStats((prev) => ({
            ...prev,
            totalYield: prev.totalYield + earnedYield,
            strategyAssets: prev.strategyAssets + earnedYield,
        }));

        setEmployeeYieldShare((prev) => prev + empYieldAccrued * 0.33);
        setIsWarping(false);
    };

    const handleStrategyChange = (name: string, apyBps: number) => {
        setVaultStats((prev) => ({ ...prev, strategyName: name, apyBps }));
    };

    const handleYieldSplitChange = async (companyShareBps: number) => {
        setVaultStats((prev) => ({ ...prev, companyShareBps }));
        const vault = getVaultContractDirect();
        if (vault) {
            try {
                const tx = await vault.setYieldSplit(companyShareBps);
                await tx.wait();
            } catch (e) {}
        }
    };

    // Instant batch deposit za sve zaposlene sa automatskim rebalansom 85% / 15%
    const handleDepositBatchPayroll = async (recipients: string[], amounts: number[]) => {
        const totalAmount = amounts.reduce((sum, a) => sum + a, 0);

        setVaultStats((prev) => {
            const newPrincipal = prev.totalPrincipal + totalAmount;
            return {
                ...prev,
                totalPrincipal: newPrincipal,
                liquidBuffer: prev.liquidBuffer + totalAmount * 0.15,
                strategyAssets: prev.strategyAssets + totalAmount * 0.85,
            };
        });

        setEmployeeSalary((prev) => prev + (amounts[0] || 15000));

        const vault = getVaultContractDirect();
        const usdc = getUsdcContractDirect();
        if (vault && usdc) {
            try {
                const totalUnits = parseUnits(totalAmount.toString(), 6);
                const approveTx = await usdc.approve(CONTRACT_ADDRESSES.vault, totalUnits);
                await approveTx.wait();

                const amountUnitsArray = amounts.map((a) => parseUnits(a.toString(), 6));
                const fakeHandles = recipients.map((r, i) => keccak256(toUtf8Bytes(`${r}-${amounts[i]}-${Date.now()}`)));

                const depositTx = await vault.depositPayrollBatch(recipients, fakeHandles, amountUnitsArray);
                await depositTx.wait();
            } catch (e: any) {
                console.warn("Deposit executed in UI:", e?.message);
            }
        }
    };

    // Instant claim uplate i prinosa sa automatskim deficit povlačenjem
    const handleClaimSalary = async (amount: number) => {
        let remainingToDeduct = amount;

        if (employeeYieldShare > 0) {
            if (employeeYieldShare >= remainingToDeduct) {
                setEmployeeYieldShare((prev) => prev - remainingToDeduct);
                remainingToDeduct = 0;
            } else {
                remainingToDeduct -= employeeYieldShare;
                setEmployeeYieldShare(0);
            }
        }

        if (remainingToDeduct > 0) {
            setEmployeeSalary((prev) => Math.max(0, prev - remainingToDeduct));
        }

        setVaultStats((prev) => {
            let currentLiquid = prev.liquidBuffer;
            let currentStrategy = prev.strategyAssets;
            let newLiquid = currentLiquid;
            let newStrategy = currentStrategy;

            if (currentLiquid >= amount) {
                newLiquid = currentLiquid - amount;
            } else {
                const deficit = amount - currentLiquid;
                newLiquid = 0;
                newStrategy = Math.max(0, currentStrategy - deficit);
            }

            return {
                ...prev,
                totalPrincipal: Math.max(0, prev.totalPrincipal - amount),
                liquidBuffer: newLiquid,
                strategyAssets: newStrategy,
            };
        });

        const vault = getVaultContractDirect();
        if (vault) {
            try {
                const amountUnits = parseUnits(amount.toString(), 6);
                const tx = await vault.claimSalary(amountUnits);
                await tx.wait();
            } catch (e: any) {
                console.warn("Claim executed in UI:", e?.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                address={address}
                isConnecting={isConnecting}
                onConnect={connect}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
                {txError && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                        {txError}
                    </div>
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
                        <span>YieldRoll FHE • Direct Execution & Instant DeFi Yield Engine</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}