// Local Hardhat Network Config (Chain ID 31337)
export const CONTRACT_ADDRESSES = {
  vault: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  usdc: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  strategy: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
};

export const NETWORK = {
  chainId: 31337,
  chainIdHex: "0x7a69", // 31337 u hex formatu za MetaMask
  chainName: "Local Hardhat Node",
  rpcUrl: "http://127.0.0.1:8545",
};

export const VAULT_ABI = [
  "function employer() view returns (address)",
  "function token() view returns (address)",
  "function getVaultStats() view returns (uint256 totalPrincipal, uint256 liquidBuffer, uint256 strategyAssets, uint256 totalYield, uint256 currentApyBps, string currentStrategyName)",
  "function getEmployeeEncryptedBalance(address employee) view returns (bytes32 encryptedPrincipal, bytes32 encryptedYieldBonus, uint256 rawPrincipal, uint256 rawYieldBonus)",
  "function getEmployeeCount() view returns (uint256)",
  "function companyYieldShareBps() view returns (uint256)",
  "function claimSalary(uint256 amount)",
  "function harvestYield() returns (uint256)",
  "function depositPayrollBatch(address[] recipients, bytes32[] fheCiphertextHandles, uint256[] rawAmounts)",
  "event SalaryClaimed(address indexed employee, uint256 claimedAmount, uint256 remainingTotalBalance)",
  "event PayrollDeposited(uint256 totalAmount, uint256 recipientCount)",
  "event YieldHarvested(uint256 totalYield, uint256 companyShare, uint256 employeeShare)",
];

export const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function decimals() view returns (uint8)",
];
