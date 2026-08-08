const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting YieldRoll FHE Deployment...");

  const [employer, emp1, emp2, emp3] = await hre.ethers.getSigners();
  console.log(`Deployer / Employer address: ${employer.address}`);

  // 1. Deploy Mock USDC (1,000,000 USDC)
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy(hre.ethers.parseUnits("1000000", 6));
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`✅ MockUSDC deployed to: ${usdcAddress}`);

  // 2. Deploy Mock Yield Strategy (Aave v3 Mock with 7.5% APY)
  const MockYieldStrategy = await hre.ethers.getContractFactory("MockYieldStrategy");
  const aaveMockStrategy = await MockYieldStrategy.deploy(usdcAddress, "Aave v3 Core USDC Pool", 750);
  await aaveMockStrategy.waitForDeployment();
  const aaveStrategyAddress = await aaveMockStrategy.getAddress();
  console.log(`✅ Aave v3 Mock Strategy deployed to: ${aaveStrategyAddress}`);

  // 3. Deploy FHEYieldPayrollVault
  const FHEYieldPayrollVault = await hre.ethers.getContractFactory("FHEYieldPayrollVault");
  const vault = await FHEYieldPayrollVault.deploy(usdcAddress, aaveStrategyAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ FHEYieldPayrollVault deployed to: ${vaultAddress}`);

  // 4. Seed Demo Payroll
  console.log("\n🌱 Seeding Demo Payroll...");
  const payrollAmount = hre.ethers.parseUnits("50000", 6); // 50,000 USDC Total Payroll
  await usdc.approve(vaultAddress, payrollAmount);

  const recipients = [emp1.address, emp2.address, emp3.address];
  const amounts = [
    hre.ethers.parseUnits("15000", 6), // Emp 1: 15,000 USDC
    hre.ethers.parseUnits("20000", 6), // Emp 2: 20,000 USDC
    hre.ethers.parseUnits("15000", 6)  // Emp 3: 15,000 USDC
  ];

  // Simulated FHE Ciphertext handles
  const fheHandles = [
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("FHE_HANDLE_EMP_1_15000")),
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("FHE_HANDLE_EMP_2_20000")),
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("FHE_HANDLE_EMP_3_15000"))
  ];

  await vault.depositPayrollBatch(recipients, amounts, fheHandles);
  console.log("✅ Batch Payroll Deposited! 85% routed to Aave Yield Strategy, 15% kept in Liquid Buffer.");

  const stats = await vault.getVaultStats();
  console.log("\n📊 Initial Vault Stats:");
  console.log(`- Total Principal: ${hre.ethers.formatUnits(stats[0], 6)} USDC`);
  console.log(`- Liquid Buffer (15%): ${hre.ethers.formatUnits(stats[1], 6)} USDC`);
  console.log(`- Strategy Assets (85%): ${hre.ethers.formatUnits(stats[2], 6)} USDC`);
  console.log(`- Strategy APY: ${Number(stats[4]) / 100}%`);

  console.log("\n🎉 Deployment & Setup Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
