"use client";

import React from "react";
import { ShieldCheck, Cpu, Wallet, Layers, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "cfo" | "employee";
  setActiveTab: (tab: "cfo" | "employee") => void;
  address: string | null;
  isConnecting: boolean;
  onConnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, address, isConnecting, onConnect }) => {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                YieldRoll <span className="gradient-text-indigo">FHE</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Zama fhEVM
              </span>
            </div>
            <p className="text-xs text-slate-400">Confidential & Yield-Generating Payroll</p>
          </div>
        </div>

        {/* View Switcher (CFO vs Employee) */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("cfo")}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "cfo"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            CFO / Employer Dashboard
          </button>
          <button
            onClick={() => setActiveTab("employee")}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "employee"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Employee Portal
          </button>
        </div>

        {/* Network & Wallet Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tenderly Virtual Testnet (Chain 9991 - petnica2026)
          </div>
          {shortAddress ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-slate-200">{shortAddress}</span>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/60 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              {isConnecting ? "Povezujem..." : "Poveži MetaMask"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
