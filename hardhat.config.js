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
    },
    zamaDevnet: {
      url: "https://devnet.zama.ai",
      chainId: 8000,
    },
    tenderly: {
      url: process.env.TENDERLY_VIRTUAL_TESTNET_URL || "https://virtual.mainnet.rpc.tenderly.co/demo",
      chainId: 1,
    },
  },
};
