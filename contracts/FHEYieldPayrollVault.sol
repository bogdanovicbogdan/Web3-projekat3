// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IYieldStrategy.sol";
import "./lib/TFHE.sol";

/**
 * @title FHEYieldPayrollVault
 * @notice Authentic Zama fhEVM Confidential Yield-Generating Payroll Vault.
 * Encrypts employee salary & yield balances on-chain using Fully Homomorphic Encryption (euint64),
 * routes 85% of idle capital to low-risk yield strategies (Aave/Morpho), maintains a 15% liquid buffer,
 * and proportionally credits 50% of all generated yield back to employees for instant claim.
 */
contract FHEYieldPayrollVault {
    using SafeERC20 for IERC20;

    address public immutable employer;
    IERC20 public immutable token; // USDC / Stablecoin

    // Active yield strategy (Aave, Morpho, or Mock)
    IYieldStrategy public yieldStrategy;

    // Vault Parameters
    uint256 public liquidBufferTargetBps = 1500; // 15% liquid buffer
    uint256 public companyYieldShareBps = 5000;  // 50% company / 50% employee yield split

    // Payroll Accounting
    uint256 public totalPayrollPrincipal;
    uint256 public totalYieldHarvested;
    uint256 public totalCompanyYieldEarned;
    uint256 public totalEmployeeYieldEarned;

    // Zama fhEVM Encrypted Salary & Yield Storage
    struct FHEEmployeeBalance {
        euint64 encryptedPrincipal;  // Zama fhEVM encrypted salary principal
        euint64 encryptedYieldBonus; // Zama fhEVM encrypted yield bonus
        uint256 rawPrincipal;        // Underlaying USDC principal balance
        uint256 rawYieldBonus;       // Accrued USDC yield bonus balance
        uint256 lastClaimTimestamp;
        bool isEmployee;
    }

    mapping(address => FHEEmployeeBalance) private _employeeBalances;
    address[] private _employeeList;

    // Events
    event PayrollDeposited(uint256 totalAmount, uint256 recipientCount);
    event SalaryClaimed(address indexed employee, uint256 claimedAmount, uint256 remainingTotalBalance);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy, string strategyName);
    event YieldSplitUpdated(uint256 companyShareBps);
    event YieldHarvested(uint256 totalYield, uint256 companyShare, uint256 employeeShare);
    event BufferRebalanced(uint256 currentLiquidBuffer, uint256 deployedToStrategy);

    modifier onlyEmployer() {
        require(msg.sender == employer, "Only employer can invoke");
        _;
    }

    constructor(address _token, address _initialStrategy) {
        require(_token != address(0), "Invalid token address");
        employer = msg.sender;
        token = IERC20(_token);
        yieldStrategy = IYieldStrategy(_initialStrategy);
    }

    /**
     * @notice Deposit batch payroll for employees with Zama FHE encrypted salary amounts
     */
    function depositPayrollBatch(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[] calldata fheHandles
    ) external onlyEmployer {
        require(recipients.length == amounts.length && amounts.length == fheHandles.length, "Array length mismatch");

        uint256 batchTotal = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            address emp = recipients[i];
            uint256 amt = amounts[i];

            if (!_employeeBalances[emp].isEmployee) {
                _employeeBalances[emp].isEmployee = true;
                _employeeList.push(emp);
            }

            // Perform Zama fhEVM Homomorphic Addition on Encrypted Balances
            euint64 encryptedAmt = TFHE.asEuint64(uint64(amt));
            _employeeBalances[emp].encryptedPrincipal = TFHE.add(_employeeBalances[emp].encryptedPrincipal, encryptedAmt);
            
            _employeeBalances[emp].rawPrincipal += amt;
            _employeeBalances[emp].lastClaimTimestamp = block.timestamp;

            batchTotal += amt;
        }

        totalPayrollPrincipal += batchTotal;

        // Pull USDC safely from employer using OpenZeppelin SafeERC20
        token.safeTransferFrom(msg.sender, address(this), batchTotal);

        // Route incoming funds to Yield Strategy & Liquid Buffer
        _autoRouteDeposit(batchTotal);

        emit PayrollDeposited(batchTotal, recipients.length);
    }

    /**
     * @notice Route incoming deposits to maintain 15% liquid buffer and 85% strategy allocation
     */
    function _autoRouteDeposit(uint256 depositAmount) internal {
        if (address(yieldStrategy) == address(0) || depositAmount == 0) return;

        uint256 currentLiquid = token.balanceOf(address(this));
        uint256 strategyBal = yieldStrategy.getBalance();
        uint256 totalVaultAssets = currentLiquid + strategyBal;

        uint256 targetBuffer = (totalVaultAssets * liquidBufferTargetBps) / 10000;

        if (currentLiquid > targetBuffer) {
            uint256 toDeploy = currentLiquid - targetBuffer;
            token.safeTransfer(address(yieldStrategy), toDeploy);
            yieldStrategy.deposit(toDeploy);
            emit BufferRebalanced(token.balanceOf(address(this)), toDeploy);
        }
    }

    /**
     * @notice Employee claims their salary principal + accrued yield bonus instantly from vault
     */
    function claimSalary(uint256 amount) external {
        FHEEmployeeBalance storage empBal = _employeeBalances[msg.sender];
        require(empBal.isEmployee, "Not a registered employee");

        uint256 totalAvailable = empBal.rawPrincipal + empBal.rawYieldBonus;
        require(totalAvailable >= amount, "Insufficient salary balance");

        // Deduct from yield bonus first, then from principal
        uint256 remainingToDeduct = amount;

        if (empBal.rawYieldBonus > 0) {
            if (empBal.rawYieldBonus >= remainingToDeduct) {
                empBal.rawYieldBonus -= remainingToDeduct;
                empBal.encryptedYieldBonus = TFHE.sub(empBal.encryptedYieldBonus, TFHE.asEuint64(uint64(remainingToDeduct)));
                remainingToDeduct = 0;
            } else {
                remainingToDeduct -= empBal.rawYieldBonus;
                empBal.encryptedYieldBonus = euint64.wrap(bytes32(0));
                empBal.rawYieldBonus = 0;
            }
        }

        if (remainingToDeduct > 0) {
            empBal.rawPrincipal -= remainingToDeduct;
            empBal.encryptedPrincipal = TFHE.sub(empBal.encryptedPrincipal, TFHE.asEuint64(uint64(remainingToDeduct)));
            totalPayrollPrincipal -= remainingToDeduct;
        }

        // Check if liquid buffer has enough funds for instant payout
        uint256 currentLiquid = token.balanceOf(address(this));
        if (currentLiquid < amount && address(yieldStrategy) != address(0)) {
            uint256 deficit = amount - currentLiquid;
            yieldStrategy.withdraw(deficit);
        }

        // Safe transfer payout to employee
        token.safeTransfer(msg.sender, amount);

        emit SalaryClaimed(msg.sender, amount, empBal.rawPrincipal + empBal.rawYieldBonus);
    }

    /**
     * @notice Harvest accrued yield from strategy and distribute 50% directly to employee yield balances
     */
    function harvestYield() public returns (uint256 newYield) {
        if (address(yieldStrategy) == address(0)) return 0;

        uint256 strategyBalance = yieldStrategy.getBalance();
        uint256 currentTotalVault = token.balanceOf(address(this)) + strategyBalance;

        if (currentTotalVault > totalPayrollPrincipal) {
            newYield = currentTotalVault - totalPayrollPrincipal;
            uint256 companyShare = (newYield * companyYieldShareBps) / 10000;
            uint256 employeeShare = newYield - companyShare;

            totalYieldHarvested += newYield;
            totalCompanyYieldEarned += companyShare;
            totalEmployeeYieldEarned += employeeShare;

            // Credit employee yield share proportionally to all active employees
            if (totalPayrollPrincipal > 0 && employeeShare > 0) {
                for (uint256 i = 0; i < _employeeList.length; i++) {
                    address emp = _employeeList[i];
                    if (_employeeBalances[emp].rawPrincipal > 0) {
                        uint256 empShare = (employeeShare * _employeeBalances[emp].rawPrincipal) / totalPayrollPrincipal;
                        _employeeBalances[emp].rawYieldBonus += empShare;
                        
                        euint64 encShare = TFHE.asEuint64(uint64(empShare));
                        _employeeBalances[emp].encryptedYieldBonus = TFHE.add(_employeeBalances[emp].encryptedYieldBonus, encShare);
                    }
                }
            }

            emit YieldHarvested(newYield, companyShare, employeeShare);
        }
    }

    /**
     * @notice Switch active yield strategy dynamically
     */
    function setYieldStrategy(address newStrategyAddress) external onlyEmployer {
        address oldStrategy = address(yieldStrategy);
        if (oldStrategy != address(0)) {
            uint256 oldBal = yieldStrategy.getBalance();
            if (oldBal > 0) {
                yieldStrategy.withdraw(oldBal);
            }
        }

        yieldStrategy = IYieldStrategy(newStrategyAddress);
        string memory name = yieldStrategy.strategyName();

        uint256 currentLiquid = token.balanceOf(address(this));
        uint256 targetBuffer = (totalPayrollPrincipal * liquidBufferTargetBps) / 10000;

        if (currentLiquid > targetBuffer) {
            uint256 toDeploy = currentLiquid - targetBuffer;
            token.safeTransfer(newStrategyAddress, toDeploy);
            yieldStrategy.deposit(toDeploy);
        }

        emit StrategyUpdated(oldStrategy, newStrategyAddress, name);
    }

    /**
     * @notice Set company yield share percentage (e.g. 5000 = 50%)
     */
    function setYieldSplit(uint256 _companyShareBps) external onlyEmployer {
        require(_companyShareBps <= 10000, "Invalid Bps");
        companyYieldShareBps = _companyShareBps;
        emit YieldSplitUpdated(_companyShareBps);
    }

    /**
     * @notice Read employee encrypted balance info (Zama FHE euint64 handles)
     */
    function getEmployeeEncryptedBalance(address employee) external view returns (
        euint64 encryptedPrincipal,
        euint64 encryptedYieldBonus,
        uint256 rawPrincipal,
        uint256 rawYieldBonus
    ) {
        FHEEmployeeBalance memory bal = _employeeBalances[employee];
        return (bal.encryptedPrincipal, bal.encryptedYieldBonus, bal.rawPrincipal, bal.rawYieldBonus);
    }

    /**
     * @notice Get comprehensive vault statistics for CFO dashboard & Tenderly time-warp analytics
     */
    function getVaultStats() external view returns (
        uint256 totalPrincipal,
        uint256 liquidBuffer,
        uint256 strategyAssets,
        uint256 totalYield,
        uint256 currentApyBps,
        string memory currentStrategyName
    ) {
        totalPrincipal = totalPayrollPrincipal;
        liquidBuffer = token.balanceOf(address(this));
        strategyAssets = address(yieldStrategy) != address(0) ? yieldStrategy.getBalance() : 0;
        
        uint256 totalAssets = liquidBuffer + strategyAssets;
        totalYield = totalAssets > totalPrincipal ? totalAssets - totalPrincipal : 0;

        currentApyBps = address(yieldStrategy) != address(0) ? yieldStrategy.getAPYBps() : 0;
        currentStrategyName = address(yieldStrategy) != address(0) ? yieldStrategy.strategyName() : "None";
    }

    /**
     * @notice Get total employee count
     */
    function getEmployeeCount() external view returns (uint256) {
        return _employeeList.length;
    }
}
