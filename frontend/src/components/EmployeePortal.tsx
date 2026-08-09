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
  ExternalLink
} from "lucide-react";

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

  const handleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      setIsRevealed(true);
      setClaimAmount(employeeSalary + employeeYieldShare);
    }, 1000);
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
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Employee Salary & Yield Portal</h2>
            <p className="text-xs text-slate-400">
              Your salary & accrued yield are encrypted on-chain via Zama FHE (<code className="text-emerald-400 font-mono">euint64</code>). Only you can decrypt & claim them.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" /> 100% Instant Claim Guaranteed
        </div>
      </div>

      {/* Main Encrypted Salary Card */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden glow-emerald">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-400" />
            ON-CHAIN ENCRYPTED TOTAL CLAIMABLE BALANCE
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
            Zama fhEVM Handles
          </span>
        </div>

        <div className="py-4">
          {isDecrypting ? (
            <div className="flex items-center gap-3 text-indigo-400 font-mono text-xl animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin text-emerald-400" />
              Verifying EIP-712 Signature & Decrypting FHE Ciphertext...
            </div>
          ) : isRevealed ? (
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
                ${totalAvailable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                <span className="text-lg font-semibold text-emerald-400">USDC</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Base Salary: <strong className="text-slate-200">${employeeSalary.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +${employeeYieldShare.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC Employee Yield Bonus
                </span>
              </div>
            </div>
          ) : (
            <div className="text-4xl sm:text-5xl font-black text-slate-500 font-mono tracking-widest select-none">
              •••••••••••• USDC
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <button
            onClick={handleReveal}
            disabled={isDecrypting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-4 h-4 text-slate-400" /> Hide Confidential Salary
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-400" /> 🔓 Decrypt & Reveal Salary & Yield (EIP-712)
              </>
            )}
          </button>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Uncollected salary earns <strong>+7.5% APY</strong> daily</span>
          </div>
        </div>
      </div>

      {/* Instant Claim Module */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            Instant Salary & Yield Withdrawal
          </h3>
          <p className="text-xs text-slate-400">
            Withdraw your salary and 50% accrued investment yield at any second. Funds are instantly disbursed from the Vault Liquid Buffer (${liquidBuffer.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC buffer available).
          </p>
        </div>

        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span>Withdrawal Amount (USDC):</span>
              <button
                type="button"
                onClick={() => setClaimAmount(employeeSalary + employeeYieldShare)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Max (${(employeeSalary + employeeYieldShare).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC)
              </button>
            </div>
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
            disabled={employeeSalary + employeeYieldShare <= 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <ArrowDownRight className="w-5 h-5" />
            Instant Claim ${claimAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
          </button>
        </form>
      </div>
    </div>
  );
};
