const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FHEYieldPayrollVault (Official Zama @fhevm/solidity)", function () {
  let usdc, mockStrategy, vault;
  let employer, emp1, emp2, emp3;

  const INITIAL_MINT = ethers.parseUnits("1000000", 6); // 1,000,000 USDC
  const PAYROLL_BATCH_TOTAL = ethers.parseUnits("50000", 6); // 50,000 USDC

  beforeEach(async function () {
    [employer, emp1, emp2, emp3] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy(INITIAL_MINT);
    await usdc.waitForDeployment();

    // 2. Deploy MockYieldStrategy (7.5% APY)
    const MockYieldStrategy = await ethers.getContractFactory("MockYieldStrategy");
    mockStrategy = await MockYieldStrategy.deploy(await usdc.getAddress(), "Aave v3 Core USDC Pool", 750);
    await mockStrategy.waitForDeployment();

    // 3. Deploy FHEYieldPayrollVault
    const FHEYieldPayrollVault = await ethers.getContractFactory("FHEYieldPayrollVault");
    vault = await FHEYieldPayrollVault.deploy(await usdc.getAddress(), await mockStrategy.getAddress());
    await vault.waitForDeployment();

    // Approve Vault to spend Employer's USDC
    await usdc.approve(await vault.getAddress(), INITIAL_MINT);
  });

  it("Should deposit batch payroll with Zama externalEuint64 FHE inputs and auto-route 85% Strategy / 15% Buffer", async function () {
    const recipients = [emp1.address, emp2.address];
    const rawAmounts = [ethers.parseUnits("20000", 6), ethers.parseUnits("30000", 6)];
    const encryptedInputs = [
      ethers.keccak256(ethers.toUtf8Bytes("ZAMA_ENCRYPTED_INPUT_EMP1")),
      ethers.keccak256(ethers.toUtf8Bytes("ZAMA_ENCRYPTED_INPUT_EMP2"))
    ];

    await vault.depositPayrollBatch(recipients, encryptedInputs, rawAmounts);

    const stats = await vault.getVaultStats();
    expect(stats[0]).to.equal(PAYROLL_BATCH_TOTAL); // Total Principal: 50,000 USDC
    expect(stats[1]).to.equal(ethers.parseUnits("7500", 6)); // Liquid Buffer 15%: 7,500 USDC
    expect(stats[2]).to.equal(ethers.parseUnits("42500", 6)); // Strategy Assets 85%: 42,500 USDC
  });

  it("Should harvest yield and credit 50% yield bonus directly to employee encrypted balances", async function () {
    const recipients = [emp1.address, emp2.address];
    const rawAmounts = [ethers.parseUnits("20000", 6), ethers.parseUnits("30000", 6)];
    const encryptedInputs = [
      ethers.keccak256(ethers.toUtf8Bytes("ZAMA_ENCRYPTED_INPUT_EMP1")),
      ethers.keccak256(ethers.toUtf8Bytes("ZAMA_ENCRYPTED_INPUT_EMP2"))
    ];

    await vault.depositPayrollBatch(recipients, encryptedInputs, rawAmounts);

    // Fast forward 30 days to generate yield
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Harvest Yield
    await vault.harvestYield();

    // Check Employee 1 settlement balance (authorized caller)
    const emp1Data = await vault.connect(emp1).getEmployeeSettlementBalance(emp1.address);
    expect(emp1Data[0]).to.equal(ethers.parseUnits("20000", 6)); // Principal
    expect(emp1Data[1]).to.be.gt(0); // Accrued Yield Bonus > 0!
  });

  it("Should allow employee to claim principal AND accrued yield bonus instantly", async function () {
    const recipients = [emp1.address];
    const rawAmounts = [ethers.parseUnits("15000", 6)];
    const encryptedInputs = [ethers.keccak256(ethers.toUtf8Bytes("ZAMA_ENCRYPTED_INPUT_EMP1"))];

    await vault.depositPayrollBatch(recipients, encryptedInputs, rawAmounts);

    // Fast forward time for yield
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    await vault.harvestYield();

    const emp1Before = await usdc.balanceOf(emp1.address);

    // Employee 1 claims full salary + yield
    const emp1Data = await vault.connect(emp1).getEmployeeSettlementBalance(emp1.address);
    const totalClaimable = emp1Data[0] + emp1Data[1]; // Principal + Yield Bonus

    await vault.connect(emp1).claimSalary(totalClaimable);

    const emp1After = await usdc.balanceOf(emp1.address);
    expect(emp1After - emp1Before).to.equal(totalClaimable);
  });
});
