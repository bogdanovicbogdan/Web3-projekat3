const hre = require("hardhat");

async function main() {
  const daysToWarp = process.env.DAYS ? parseInt(process.env.DAYS) : 30;
  const secondsToWarp = daysToWarp * 24 * 60 * 60;

  console.log(`⏩ Fast-Forwarding Time by ${daysToWarp} Days (${secondsToWarp} seconds)...`);

  // Tenderly / Hardhat RPC evm_increaseTime & evm_mine
  await hre.network.provider.send("evm_increaseTime", [secondsToWarp]);
  await hre.network.provider.send("evm_mine");

  console.log(`✅ Time-Warp complete! ${daysToWarp} days elapsed on-chain.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
