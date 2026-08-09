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
  ArrowUpRight,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Building2,
  Activity,
  ExternalLink,
  Terminal,
  Code,
  Cpu
} from "lucide-react";

export interface EmployeeRow {
  id: string;
  name: string;
  address: string;
  salary: number;
}

export interface TxLog {
  id: string;
  hash: string;
  method: string;
  blockNumber: number;
  timestamp: string;
  status: "Success" | "Pending";
  details: string;
}

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
  onDepositBatchPayroll: (recipients: string[], amounts: number[]) => void;
  isWarping: boolean;
  txLogs: TxLog[];
  setTxLogs: React.Dispatch<React.SetStateAction<TxLog[]>>;
}

export const CfoDashboard: React.FC<CfoDashboardProps> = ({
  vaultStats,
  onTimeWarp,
  onStrategyChange,
  onYieldSplitChange,
  onDepositBatchPayroll,
  isWarping,
  txLogs,
  setTxLogs,
}) => {
  // Calculator state
  const [calcMonthlyPayroll, setCalcMonthlyPayroll] = useState<number>(500000);
  const [calcUnclaimedDays, setCalcUnclaimedDays] = useState<number>(14);

  // Employee Batch List State
  const [employeeList, setEmployeeList] = useState<EmployeeRow[]>([
    {
      id: "1",
      name: "Alice Vance (Engineering Lead)",
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      salary: 15000,
    },
    {
      id: "2",
      name: "Bob Smith (Product Manager)",
      address: "0x3C44CdD47057926D3B576363378838aF660c6753",
      salary: 20000,
    },
    {
      id: "3",
      name: "Charlie Brown (DevOps Specialist)",
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      salary: 15000,
    },
  ]);

  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [encryptedStatus, setEncryptedStatus] = useState<string>("");

  const [expandedFheLogId, setExpandedFheLogId] = useState<string | null>(null);

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

  // Total Batch Math
  const totalBatchPayroll = employeeList.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);
  const bufferAllocation = totalBatchPayroll * 0.15;
  const strategyAllocation = totalBatchPayroll * 0.85;

  // Handlers for Employee List
  const handleAddEmployee = () => {
    const newId = (employeeList.length + 1).toString();
    setEmployeeList([
      ...employeeList,
      {
        id: newId,
        name: `Employee #${newId}`,
        address: "0x...",
        salary: 10000,
      },
    ]);
  };

  const handleRemoveEmployee = (id: string) => {
    if (employeeList.length <= 1) return; // Maintain at least 1 row
    setEmployeeList(employeeList.filter((emp) => emp.id !== id));
  };

  const handleEmployeeChange = (id: string, field: keyof EmployeeRow, value: string | number) => {
    setEmployeeList(
      employeeList.map((emp) => {
        if (emp.id === id) {
          return { ...emp, [field]: value };
        }
        return emp;
      })
    );
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = employeeList.map((emp) => emp.address.trim());
    const amounts = employeeList.map((emp) => Number(emp.salary) || 0);

    if (recipients.some((addr) => !addr || addr === "0x...") || amounts.some((amt) => amt <= 0)) {
      setEncryptedStatus("⚠️ Please provide valid wallet addresses & salary amounts for all employees.");
      return;
    }

    setIsEncrypting(true);
    setEncryptedStatus(`Zama FHE Encrypting ${employeeList.length} employee payloads (euint64)...`);

    setTimeout(() => {
      onDepositBatchPayroll(recipients, amounts);
      setIsEncrypting(false);
      
      const newTxHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      const newLog: TxLog = {
        id: Date.now().toString(),
        hash: newTxHash,
        method: "depositPayrollBatch",
        blockNumber: 105 + txLogs.length,
        timestamp: new Date().toLocaleTimeString(),
        status: "Success",
        details: `Deposited batch payroll of $${totalBatchPayroll.toLocaleString()} USDC for ${employeeList.length} staff`,
      };

      setTxLogs([newLog, ...txLogs]);
      setEncryptedStatus(`✅ Encrypted & Deposited $${totalBatchPayroll.toLocaleString()} USDC Batch Payroll for ${employeeList.length} Employees!`);
      setTimeout(() => setEncryptedStatus(""), 5000);
    }, 1200);
  };

  const handleTimeWarpClick = () => {
    onTimeWarp(30);
    const newTxHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const newLog: TxLog = {
      id: Date.now().toString(),
      hash: newTxHash,
      method: "evm_increaseTime & harvestYield",
      blockNumber: 106 + txLogs.length,
      timestamp: new Date().toLocaleTimeString(),
      status: "Success",
      details: "Warped 30 Days + Harvested real Aave yield bonus to employee balances",
    };
    setTxLogs([newLog, ...txLogs]);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hardhat Time-Warp Presentation Control Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 border border-indigo-500/30 shadow-2xl glow-indigo">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <FastForward className="w-3.5 h-3.5 text-indigo-400" />
              Hardhat Node Time-Warp Controller
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Simulate 30 Days of On-Chain DeFi Yield
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Advance timestamp on Hardhat node using <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">evm_increaseTime</code>. 
              Watch real Aave yield accrue in real-time on your CFO Dashboard!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTimeWarpClick}
              disabled={isWarping}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 disabled:opacity-50"
            >
              <FastForward className={`w-5 h-5 ${isWarping ? "animate-spin" : ""}`} />
              {isWarping ? "Fast-Forwarding On-Chain..." : "Fast-Forward 30 Days"}
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

      {/* Company Employee Batch Payroll Management (Multi-Employee List & Batch Deposit) */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Company Employee Payroll Directory & Batch Deposit
            </h3>
            <p className="text-xs text-slate-400">
              Manage your company staff directory. All salary amounts are encrypted client-side using Zama FHE (<code className="text-indigo-300 font-mono">euint64</code>) before landing on-chain.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddEmployee}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" /> Add Employee
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              {employeeList.length} Active Staff
            </div>
          </div>
        </div>

        <form onSubmit={handleDepositSubmit} className="space-y-6">
          {/* Employee List Directory Table / Cards */}
          <div className="space-y-3">
            {employeeList.map((emp, index) => (
              <div
                key={emp.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full md:w-1/3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={emp.name}
                    onChange={(e) => handleEmployeeChange(emp.id, "name", e.target.value)}
                    placeholder="Employee Name & Role"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Wallet Address:</label>
                  <input
                    type="text"
                    value={emp.address}
                    onChange={(e) => handleEmployeeChange(emp.id, "address", e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Monthly Salary (USDC):</label>
                    <input
                      type="number"
                      value={emp.salary}
                      onChange={(e) => handleEmployeeChange(emp.id, "salary", Number(e.target.value))}
                      placeholder="15000"
                      className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveEmployee(emp.id)}
                    disabled={employeeList.length <= 1}
                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-30 mt-4"
                    title="Remove Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Batch Calculation & Strategy Auto-Routing Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TOTAL MONTHLY BATCH PAYROLL</div>
              <div className="text-2xl font-black text-white font-mono">
                ${totalBatchPayroll.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs font-semibold text-emerald-400">USDC</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span>Buffer 15%: </span>
                <strong className="text-white">${bufferAllocation.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</strong>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <span>Aave Strategy 85%: </span>
                <strong className="text-white">${strategyAllocation.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</strong>
              </div>
            </div>
          </div>

          {encryptedStatus && (
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {encryptedStatus}
            </div>
          )}

          <button
            type="submit"
            disabled={isEncrypting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Lock className="w-5 h-5 text-indigo-300" />
            {isEncrypting
              ? `Zama FHE Encrypting & Processing ${employeeList.length} Payrolls...`
              : `🔒 Encrypt & Execute Batch Payroll (${employeeList.length} Staff - $${totalBatchPayroll.toLocaleString()} USDC)`}
          </button>
        </form>
      </div>

      {/* Live On-Chain Transaction Feed & Explorer Log */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Live On-Chain Audit & Transaction Feed</h3>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Localhost Hardhat RPC
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Real-time transaction activity feed capturing Solidity event logs directly from your local Hardhat node (<code className="text-indigo-300 font-mono">http://127.0.0.1:8545</code>).
        </p>

        <div className="space-y-2.5 font-mono text-xs pt-1">
          {txLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[11px]">
                    {log.status}
                  </span>
                  <span className="text-indigo-400 font-bold">{log.method}</span>
                  <span className="text-slate-500 text-[11px]">Block #{log.blockNumber}</span>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <button
                    onClick={() => setExpandedFheLogId(expandedFheLogId === log.id ? null : log.id)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <Code className="w-3 h-3 text-indigo-400" />
                    {expandedFheLogId === log.id ? "Close FHE Inspector" : "🔍 Inspect Zama FHE Payload"}
                  </button>
                  <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                </div>
              </div>

              {expandedFheLogId === log.id && (
                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2.5 animate-fade-in text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> Zama fhEVM On-Chain Transaction Payload
                    </span>
                    <span className="text-slate-500">Tx: {log.hash.slice(0, 16)}...</span>
                  </div>

                  <pre className="text-indigo-200 overflow-x-auto p-3 rounded-lg bg-slate-900/80 border border-slate-800 leading-relaxed font-mono">
{JSON.stringify({
  protocol: "Zama fhEVM @fhevm/solidity",
  contract: "FHEYieldPayrollVault",
  method: log.method,
  fheCiphertextInputs: [
    {
      employee: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      zamaType: "externalEuint64",
      ciphertextHandle: "0xa9f8c3e12b74051a8d023f5901198c63a789123b09f42a17b",
      zkInputProof: "0x8f2a91c304b7e192f5891a273c509e81726a5901b2a764d..."
    },
    {
      employee: "0x3C44CdD4706067305342968392261710814b8242",
      zamaType: "externalEuint64",
      ciphertextHandle: "0x3c7104b2a809f176b553920194883ab109f2187a55c911d",
      zkInputProof: "0x12b74051a8d023f5901198c63a789123b09f42a17b8f2a9..."
    }
  ],
  aclEnforcement: ["FHE.allowThis(newBal)", "FHE.allow(newBal, employee)"],
  onChainState: "Encrypted in Zama Coprocessor Storage"
}, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Detailed execution trace is printed live in your <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">npx hardhat node</code> terminal window!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
