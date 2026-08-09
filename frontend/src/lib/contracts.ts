export const CONTRACT_ADDRESSES = {
  vault: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  usdc: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  strategy: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
};

export const NETWORK = {
  chainId: 31337,
  chainIdHex: "0x7a69", // 31337 u hex formatu, MetaMask ocekuje hex
  chainName: "Local Hardhat",
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
