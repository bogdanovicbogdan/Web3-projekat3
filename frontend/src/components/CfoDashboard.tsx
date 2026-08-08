"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  FastForward,
  Calculator,
  Shield,
  Layers,
  CheckCircle2,
  Lock,
  Percent,
  DollarSign,
  PieChart,
  ArrowUpRight
} from "lucide-react";

interface CfoDashboardProps {
  vaultStats: {
    totalPrincipal: number;
    liquidBuffer: number;
    strategyAssets: number;
    totalYield: number;
    apyBps: number;
    strategyName: string;
    companyShareBps: number;
  };
  onTimeWarp: (days: number) => void;
  onStrategyChange: (name: string, apyBps: number) => void;
  onYieldSplitChange: (companyShare: number) => void;
  onDepositPayroll: (recipient: string, amount: number) => void;
  isWarping: boolean;
}

export const CfoDashboard: React.FC<CfoDashboardProps> = ({
  vaultStats,
  onTimeWarp,
  onStrategyChange,
  onYieldSplitChange,
  onDepositPayroll,
  isWarping,
}) => {
  // Calculator state
  const [calcMonthlyPayroll, setCalcMonthlyPayroll] = useState<number>(500000);
  const [calcUnclaimedDays, setCalcUnclaimedDays] = useState<number>(14);

  // Deposit Form State
  const [recipientAddress, setRecipientAddress] = useState<string>("0x3C44CdD47057926D3B576363378838aF660c6753");
  const [depositAmount, setDepositAmount] = useState<number>(15000);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [encryptedStatus, setEncryptedStatus] = useState<string>("");

  // Strategy Options
  const strategies = [
    { name: "Aave v3 Core USDC Pool", apy: 750, label: "7.50% APY", desc: "battle-tested liquidity lending" },
    { name: "Morpho Steakhouse Vault", apy: 820, label: "8.20% APY", desc: "optimized peer-to-peer vault" },
    { name: "Ondo RWA US T-Bills", apy: 520, label: "5.20% APY", desc: "risk-free U.S. treasury yield" },
    { name: "Mock High-Yield Strategy", apy: 1200, label: "12.00% APY", desc: "high yield demo pool" },
  ];

  // ROI Calculator Math
  const annualYieldUSD = (calcMonthlyPayroll * (calcUnclaimedDays / 365) * (vaultStats.apyBps / 10000)) * 12;
  const companyProfitAnnual = annualYieldUSD * (vaultStats.companyShareBps / 10000);
  const employeeBonusAnnual = annualYieldUSD * (1 - vaultStats.companyShareBps / 10000);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAddress || depositAmount <= 0) return;
    setIsEncrypting(true);
    setEncryptedStatus("Zama FHE Encrypting `euint64` payload...");
    
    setTimeout(() => {
      onDepositPayroll(recipientAddress, depositAmount);
      setIsEncrypting(false);
      setEncryptedStatus("✅ Encrypted & Deposited to Vault!");
      setTimeout(() => setEncryptedStatus(""), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Tenderly Time-Warp Presentation Control Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 border border-indigo-500/30 shadow-2xl glow-indigo">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <FastForward className="w-3.5 h-3.5 text-indigo-400" />
              Tenderly Virtual Testnet Demo Controller
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Simulate 30 Days of On-Chain DeFi Yield
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Advance timestamp on Tenderly RPC using <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">evm_increaseTime</code>. 
              Watch real Aave yield accrue in real-time on your CFO Dashboard!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onTimeWarp(30)}
              disabled={isWarping}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 disabled:opacity-50"
            >
              <FastForward className={`w-5 h-5 ${isWarping ? "animate-spin" : ""}`} />
              {isWarping ? "Fast-Forwarding On-Chain..." : "⏩ Fast-Forward 30 Days"}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Vault TVL */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>TOTAL VAULT TVL</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${(vaultStats.totalPrincipal + vaultStats.totalYield).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +${vaultStats.totalYield.toFixed(2)}
            </span>
            <span>earned yield</span>
          </div>
        </div>

        {/* Liquid Buffer */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>LIQUID BUFFER (15%)</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            ${vaultStats.liquidBuffer.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-slate-400">Guarantees 100% instant withdrawals</p>
        </div>

        {/* Deployed Strategy Assets */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>DEPLOYED YIELD (85%)</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">
            ${vaultStats.strategyAssets.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-purple-400 font-medium">{vaultStats.strategyName}</p>
        </div>

        {/* Active Strategy APY */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>ACTIVE STRATEGY APY</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-teal-300 font-mono">
            {(vaultStats.apyBps / 100).toFixed(2)}% APY
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Company Share:</span>
            <span className="font-semibold text-slate-200">{vaultStats.companyShareBps / 100}%</span>
          </div>
        </div>
      </div>

      {/* Strategy Switcher & Yield Split Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modular Yield Strategy Selection */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Modular Yield Strategy Selection
            </h3>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">
              Strategy Pattern
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Switch yield strategies dynamically. All idle payroll capital automatically routes to the chosen protocol.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {strategies.map((strat) => {
              const isSelected = vaultStats.strategyName === strat.name;
              return (
                <button
                  key={strat.name}
                  onClick={() => onStrategyChange(strat.name, strat.apy)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{strat.name}</span>
                    <span className="text-xs font-extrabold text-emerald-400">{strat.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{strat.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Yield Split Configurator */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-400" />
              Yield Split Configurator
            </h3>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium">
              Treasury vs Employee
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Decide how much of the generated yield goes back to company treasury vs rewarded to employees as bonus savings.
          </p>

          <div className="space-y-6 pt-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-indigo-400">Company Share: {vaultStats.companyShareBps / 100}%</span>
                <span className="text-emerald-400">Employee Share: {100 - vaultStats.companyShareBps / 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={vaultStats.companyShareBps}
                onChange={(e) => onYieldSplitChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Company Treasury</span>
                <span className="text-base font-bold text-indigo-300">
                  {vaultStats.companyShareBps / 100}% Yield
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Reduces total operational payroll cost</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Employee Incentive</span>
                <span className="text-base font-bold text-emerald-300">
                  {100 - vaultStats.companyShareBps / 100}% Yield
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Rewards staff for keeping funds on platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CFO Treasury ROI & Pitch Calculator */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              CFO Treasury ROI & Pitch Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Calculate projected annual earnings for corporate CFO pitch presentations.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            Estimated APY: {(vaultStats.apyBps / 100).toFixed(2)}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Monthly Payroll Volume:</span>
                <span className="text-emerald-400 font-bold font-mono">${calcMonthlyPayroll.toLocaleString()} USDC</span>
              </div>
              <input
                type="range"
                min="50000"
                max="3000000"
                step="50000"
                value={calcMonthlyPayroll}
                onChange={(e) => setCalcMonthlyPayroll(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Average Claim Delay (Days Unclaimed):</span>
                <span className="text-indigo-400 font-bold font-mono">{calcUnclaimedDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={calcUnclaimedDays}
                onChange={(e) => setCalcUnclaimedDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/20 flex flex-col justify-between space-y-4">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">PROJECTED ANNUAL EARNINGS</span>
            <div>
              <div className="text-3xl font-black text-white font-mono">
                ${annualYieldUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })} <span className="text-sm font-semibold text-slate-400">USDC / year</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Free treasury yield generated on uncollected payroll capital</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Company Net Earnings:</span>
                <span className="text-indigo-300 font-bold font-mono">${companyProfitAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Employee Bonus Pool:</span>
                <span className="text-emerald-300 font-bold font-mono">${employeeBonusAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Payroll Deposit Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Deposit FHE Encrypted Payroll
            </h3>
            <p className="text-xs text-slate-400">
              Salary amounts are encrypted client-side using Zama FHE (<code className="text-indigo-300 font-mono">euint64</code>) before landing on-chain.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> FHE Encrypted Batch
          </div>
        </div>

        <form onSubmit={handleDepositSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Employee Wallet Address:
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Salary Amount (USDC):
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                placeholder="15000"
                required
              />
            </div>
          </div>

          {encryptedStatus && (
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {encryptedStatus}
            </div>
          )}

          <button
            type="submit"
            disabled={isEncrypting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {isEncrypting ? "Encrypting & Executing Batch..." : "Encrypt & Deposit Payroll to Vault"}
          </button>
        </form>
      </div>
    </div>
  );
};
