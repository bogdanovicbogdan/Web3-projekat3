const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting YieldRoll FHE Deployment...");

    const [employer, ...allEmployees] = await hre.ethers.getSigners();
    console.log(`Deployer / Employer address: ${employer.address}`);
    console.log(`Broj dostupnih zaposlenih naloga: ${allEmployees.length}`);

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

    // 4. Seed Demo Payroll - SVI dostupni test nalozi dobijaju platu
    console.log("\n🌱 Seeding Demo Payroll za sve zaposlene...");

    const recipients = allEmployees.map((e) => e.address);

    // Iznosi variraju po nalogu (15k - 34k), samo radi realisticnijeg izgleda u demo-u
    const amounts = allEmployees.map((_, i) =>
        hre.ethers.parseUnits((15000 + (i % 5) * 5000).toString(), 6)
    );

    const payrollAmount = amounts.reduce((sum, a) => sum + a, 0n);
    await usdc.approve(vaultAddress, payrollAmount);

    // Simulated FHE Ciphertext handles - jedan po zaposlenom
    const fheHandles = recipients.map((addr, i) =>
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes(`FHE_HANDLE_${addr}_${amounts[i]}`))
    );

    await vault.depositPayrollBatch(recipients, fheHandles, amounts);
    console.log(`✅ Batch Payroll Deposited za ${recipients.length} zaposlenih! 85% routed to Aave Yield Strategy, 15% kept in Liquid Buffer.`);
    console.log(`   Ukupno isplaceno: ${hre.ethers.formatUnits(payrollAmount, 6)} USDC`);

    const stats = await vault.getVaultStats();
    console.log("\n📊 Initial Vault Stats:");
    console.log(`- Total Principal: ${hre.ethers.formatUnits(stats[0], 6)} USDC`);
    console.log(`- Liquid Buffer (15%): ${hre.ethers.formatUnits(stats[1], 6)} USDC`);
    console.log(`- Strategy Assets (85%): ${hre.ethers.formatUnits(stats[2], 6)} USDC`);
    console.log(`- Strategy APY: ${Number(stats[4]) / 100}%`);

    console.log("\Deployment & Setup Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});