"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowDownRight,
  CheckCircle2,
  Lock,
  Wallet,
  Clock,
  Key
} from "lucide-react";
import { authenticateAndDecryptSalary } from "@/lib/fheClient";

interface EmployeePortalProps {
  employeeSalary: number;
  employeeYieldShare: number;
  onClaimSalary: (amount: number) => void;
  liquidBuffer: number;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  employeeSalary,
  employeeYieldShare,
  onClaimSalary,
  liquidBuffer,
}) => {
  const totalAvailable = employeeSalary + employeeYieldShare;

  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [claimAmount, setClaimAmount] = useState<number>(totalAvailable);
  const [claimSuccess, setClaimSuccess] = useState<string>("");
  const [eip712Proof, setEip712Proof] = useState<string>("");

  const handleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    setIsDecrypting(true);
    try {
      const auth = await authenticateAndDecryptSalary("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "ZAMA_EUINT64_HANDLE");
      if (auth.success) {
        setEip712Proof(auth.signature.slice(0, 18) + "...");
        setIsRevealed(true);
        setClaimAmount(employeeSalary + employeeYieldShare);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const maxBalance = employeeSalary + employeeYieldShare;
    if (claimAmount <= 0 || claimAmount > maxBalance) return;

    const isDeficit = claimAmount > liquidBuffer;
    const deficitAmount = isDeficit ? claimAmount - liquidBuffer : 0;

    onClaimSalary(claimAmount);
    
    if (isDeficit) {
      setClaimSuccess(`⚡ Auto-Rebalance Claimed: $${claimAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC! ($${liquidBuffer.toLocaleString("en-US", { minimumFractionDigits: 2 })} from Liquid Buffer + $${deficitAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} pulled directly from Aave Strategy)`);
    } else {
      setClaimSuccess(`✅ Successfully claimed $${claimAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC to your wallet!`);
    }
    setTimeout(() => setClaimSuccess(""), 6000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              🔒 Zama fhEVM Confidential Storage
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Employee Compensation & Yield Portal
            </h2>
            <p className="text-xs text-slate-400">
              Your salary balance is encrypted on-chain using Zama FHE (<code className="text-emerald-300 font-mono">euint64</code>). Only your wallet EIP-712 key can decrypt this balance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ACL Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Main Balance Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encrypted Principal Salary */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MONTHLY SALARY PRINCIPAL</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="py-2">
            {isRevealed ? (
              <div className="text-3xl font-black text-white font-mono animate-fade-in">
                ${employeeSalary.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-semibold">USDC</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-indigo-300 font-mono text-sm font-semibold bg-slate-950/80 p-3.5 rounded-xl border border-indigo-500/20">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">0x8a91f3e... (euint64 Ciphertext)</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Encrypted base salary allocated by employer treasury.
          </p>
        </div>

        {/* Accrued DeFi Yield Bonus */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden space-y-4 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> ACCRUED DEFI YIELD BONUS
            </span>
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              50% Yield Share
            </span>
          </div>

          <div className="py-2">
            {isRevealed ? (
              <div className="text-3xl font-black text-emerald-300 font-mono animate-fade-in flex items-baseline gap-1">
                +${employeeYieldShare.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs text-emerald-400 font-semibold">USDC</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-300 font-mono text-sm font-semibold bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">0x3c7104b... (euint64 Yield Bonus)</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Bonus interest earned from idle payroll capital deployed in Aave v3.
          </p>
        </div>
      </div>

      {/* Reveal / Decrypt Action Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            EIP-712 Re-encryption Decryption Key
          </div>
          <p className="text-xs text-slate-400">
            Authenticate with your wallet key to decrypt on-chain Zama <code className="text-indigo-300 font-mono">euint64</code> balance handles.
          </p>
          {eip712Proof && (
            <span className="text-[11px] font-mono text-emerald-400 block pt-1">
              EIP-712 Proof: {eip712Proof}
            </span>
          )}
        </div>

        <button
          onClick={handleReveal}
          disabled={isDecrypting}
          className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg ${
            isRevealed
              ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20"
          }`}
        >
          {isDecrypting ? (
            <>
              <ShieldCheck className="w-4 h-4 animate-spin text-indigo-300" />
              Authenticating EIP-712 Proof...
            </>
          ) : isRevealed ? (
            <>
              <EyeOff className="w-4 h-4 text-slate-400" /> Hide Balance
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-white" /> Authenticate & Decrypt Salary
            </>
          )}
        </button>
      </div>

      {/* Claim Payout Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
              Instant Salary Payout Claim
            </h3>
            <p className="text-xs text-slate-400">
              Withdraw available salary principal and earned yield bonus directly to your wallet in USDC.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">TOTAL CLAIMABLE</span>
            <span className="text-lg font-extrabold text-white font-mono">
              ${totalAvailable.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
            </span>
          </div>
        </div>

        <form onSubmit={handleClaim} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Withdrawal Amount (USDC):
            </label>
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(Number(e.target.value))}
              max={employeeSalary + employeeYieldShare}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {claimAmount > liquidBuffer && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Automated Liquidity Rebalance:</strong> Claim exceeds current liquid buffer (${liquidBuffer.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC). Vault will automatically withdraw <strong>${(claimAmount - liquidBuffer).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</strong> deficit from Aave Strategy to fulfill payout instantly.
              </span>
            </div>
          )}

          {claimSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{claimSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={totalAvailable <= 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Wallet className="w-5 h-5 text-slate-950" />
            Claim ${claimAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC to Wallet
          </button>
        </form>
      </div>
    </div>
  );
};
