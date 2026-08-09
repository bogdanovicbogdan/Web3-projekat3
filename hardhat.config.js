require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      initialBaseFeePerGas: 0,
      gasPrice: 0,
    },
    zamaDevnet: {
      url: "https://devnet.zama.ai",
      chainId: 8000,
    },
    tenderly: {
      url: process.env.TENDERLY_VIRTUAL_TESTNET_URL || "https://virtual.mainnet.eu.rpc.tenderly.co/petnica2026/project/3fe3c6-adac14",
      chainId: 9991,
    },
  },
};
