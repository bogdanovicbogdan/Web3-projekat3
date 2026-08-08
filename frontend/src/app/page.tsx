"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CfoDashboard } from "@/components/CfoDashboard";
import { EmployeePortal } from "@/components/EmployeePortal";
import { Shield, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"cfo" | "employee">("cfo");
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Core Vault State (Connected to Tenderly Virtual Testnet / Hardhat contracts)
  const [vaultStats, setVaultStats] = useState({
    totalPrincipal: 50000,
    liquidBuffer: 7500, // 15%
    strategyAssets: 42500, // 85%
    totalYield: 0,
    apyBps: 750, // 7.50% APY
    strategyName: "Aave v3 Core USDC Pool",
    companyShareBps: 5000, // 50% company / 50% employee
  });

  // Employee State
  const [employeeSalary, setEmployeeSalary] = useState<number>(15000);
  const [employeeYieldShare, setEmployeeYieldShare] = useState<number>(0);

  // Tenderly Time-Warp Handler
  const handleTimeWarp = (days: number) => {
    setIsWarping(true);

    setTimeout(() => {
      // Yield = principal * APY * (days / 365)
      const newYield = vaultStats.totalPrincipal * (vaultStats.apyBps / 10000) * (days / 365);
      const companyYield = newYield * (vaultStats.companyShareBps / 10000);
      const empYield = newYield * (1 - vaultStats.companyShareBps / 10000);

      setVaultStats((prev) => ({
        ...prev,
        totalYield: prev.totalYield + newYield,
        strategyAssets: prev.strategyAssets + newYield,
      }));

      // Update employee yield share (assuming 30% of total payroll)
      setEmployeeYieldShare((prev) => prev + empYield * 0.3);
      setIsWarping(false);
    }, 1200);
  };

  // Strategy Switcher Handler
  const handleStrategyChange = (name: string, apyBps: number) => {
    setVaultStats((prev) => ({
      ...prev,
      strategyName: name,
      apyBps: apyBps,
    }));
  };

  // Yield Split Handler
  const handleYieldSplitChange = (companyShareBps: number) => {
    setVaultStats((prev) => ({
      ...prev,
      companyShareBps: companyShareBps,
    }));
  };

  // Payroll Deposit Handler
  const handleDepositPayroll = (recipient: string, amount: number) => {
    const newPrincipal = vaultStats.totalPrincipal + amount;
    const newBuffer = newPrincipal * 0.15;
    const newStrategyAssets = newPrincipal * 0.85;

    setVaultStats((prev) => ({
      ...prev,
      totalPrincipal: newPrincipal,
      liquidBuffer: newBuffer,
      strategyAssets: newStrategyAssets,
    }));

    setEmployeeSalary((prev) => prev + amount);
  };

  // Salary & Yield Bonus Claim Handler (With Automated Strategy Deficit Withdrawal)
  const handleClaimSalary = (amount: number) => {
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
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>

      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-8 relative z-10">
        {/* Dynamic Tab Content */}
        {activeTab === "cfo" ? (
          <CfoDashboard
            vaultStats={vaultStats}
            onTimeWarp={handleTimeWarp}
            onStrategyChange={handleStrategyChange}
            onYieldSplitChange={handleYieldSplitChange}
            onDepositPayroll={handleDepositPayroll}
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

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 px-4 mt-auto text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>YieldRoll FHE • Hackathon Presentation Build</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> ERC-4626 Vault</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Zama fhEVM</span>
            <span>•</span>
            <span>Tenderly Virtual Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
