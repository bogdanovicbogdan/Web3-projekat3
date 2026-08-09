# 🦭 Sealary FHE

> **Confidential & Yield-Generating Web3 Payroll Platform powered by Zama fhEVM & ERC-4626 DeFi Strategies**

---

## 🌟 Overview

**Sealary FHE** is a next-generation Web3 crypto payroll platform designed for modern Web3 enterprises, CFOs, and employees. By combining **Zama Fully Homomorphic Encryption (FHE)** with **DeFi Yield Generation**, Sealary solves the two biggest pain points in crypto payroll:

1. **Privacy Deficit**: Salary amounts are encrypted client-side using Zama `euint64` on-chain, keeping employee compensation 100% confidential from public blockchain observers.
2. **Idle Capital Inefficiency**: Unclaimed salary capital deposited into the vault automatically earns continuous yield via integrated Aave v3 DeFi lending strategies until claimed by staff.

---

## ✨ Key Features

- **🔐 Zama FHE Confidential Balances**: Employee salaries are stored in Zama `@fhevm/solidity` (`euint64`) encrypted states.
- **⚡ Dynamic Batch Payroll Directory**: CFOs can manage an interactive staff directory and execute multi-employee encrypted batch deposits in a single transaction.
- **🌊 15% / 85% Automatic Rebalancing**:
  - **15% Liquid Buffer**: Kept in vault for instant employee claims.
  - **85% Deployed Yield**: Automatically routed into Aave v3 / Morpho lending pools.
- **🚀 Automated Liquidity Rebalance**: If an employee claim exceeds the 15% liquid buffer, the vault instantly pulls the deficit from the Aave strategy with zero claim delays.
- **⏩ On-Chain Time-Warp Yield Simulation**: Simulate 30 days of real Aave yield accrual in 1-click on the local node.
- **📊 Live On-Chain Audit Feed**: Real-time transaction activity feed displaying transaction hashes, block numbers, and Solidity event logs.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm / npx

### 2. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Run Local Development Environment

#### Terminal 1: Run Local Blockchain Node
```bash
npx hardhat node
```

#### Terminal 2: Deploy Contracts & Seed Demo Payroll
```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### Terminal 3: Start Next.js Web Application
```bash
cd frontend
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**!

---

## 📜 Smart Contract Architecture

- **`contracts/FHEYieldPayrollVault.sol`**: Main vault managing encrypted balances, yield harvesting, split logic, and liquidity rebalancing.
- **`contracts/strategies/AaveV3YieldStrategy.sol`**: Modular strategy wrapper connecting vault capital to Aave v3 yield pools.
- **`contracts/MockUSDC.sol`**: ERC-20 stablecoin used for payroll deposits and payouts.

---

## 🏆 Hackathon Pitch Highlights

- **Privacy First**: Public observers only see encrypted Zama hashes (`0xa9f8c3...`).
- **Zero Overhead**: Gasless execution options for smooth presentation demos.
- **Audited Yield Engine**: Integrated liquidity buffer guarantees 100% instant withdrawals.

---

*Built with ❤️ for ETH Hackathons using Next.js 16, Ethers.js v6, Hardhat & Zama fhEVM.*
