// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IYieldStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockYieldStrategy
 * @notice High-yield strategy simulator designed for hackathon demos & Tenderly time-warp testing.
 * Accrues yield continuously based on timestamp delta or manual time-warp.
 */
contract MockYieldStrategy is IYieldStrategy {
    address public immutable underlyingAsset;
    string public override strategyName;
    uint256 public override getAPYBps; // APY in basis points (e.g. 750 = 7.50% APY)

    uint256 public totalPrincipal;
    uint256 public lastUpdateTimestamp;

    // Simulated accrued yield pool
    uint256 private _simulatedYieldAccrued;

    event DepositedToStrategy(uint256 amount, uint256 newTotalBalance);
    event WithdrawnFromStrategy(uint256 amount, uint256 remainingBalance);
    event YieldHarvested(uint256 yieldAmount);

    constructor(address _underlyingAsset, string memory _name, uint256 _initialApyBps) {
        underlyingAsset = _underlyingAsset;
        strategyName = _name;
        getAPYBps = _initialApyBps;
        lastUpdateTimestamp = block.timestamp;
    }

    /**
     * @notice Accrue yield based on elapsed time and configured APY
     */
    function _updateAccruedYield() internal {
        if (totalPrincipal == 0) {
            lastUpdateTimestamp = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastUpdateTimestamp;
        if (timeElapsed > 0) {
            // Yield = principal * APY * timeElapsed / (365 days * 10,000 basis points)
            uint256 newYield = (totalPrincipal * getAPYBps * timeElapsed) / (365 days * 10000);
            _simulatedYieldAccrued += newYield;
            lastUpdateTimestamp = block.timestamp;
        }
    }

    function deposit(uint256 amount) external override returns (uint256 shares) {
        _updateAccruedYield();
        totalPrincipal += amount;
        emit DepositedToStrategy(amount, getBalance());
        return amount; // 1:1 shares
    }

    function withdraw(uint256 amount) external override returns (uint256 actualAmount) {
        _updateAccruedYield();
        
        uint256 totalAvail = getBalance();
        actualAmount = amount > totalAvail ? totalAvail : amount;

        if (actualAmount <= _simulatedYieldAccrued) {
            _simulatedYieldAccrued -= actualAmount;
        } else {
            uint256 remainingFromPrincipal = actualAmount - _simulatedYieldAccrued;
            _simulatedYieldAccrued = 0;
            if (remainingFromPrincipal <= totalPrincipal) {
                totalPrincipal -= remainingFromPrincipal;
            } else {
                totalPrincipal = 0;
            }
        }

        emit WithdrawnFromStrategy(actualAmount, getBalance());

        // Ensure strategy has enough USDC tokens (mint simulated yield if needed)
        uint256 currentBal = IERC20(underlyingAsset).balanceOf(address(this));
        if (currentBal < actualAmount) {
            // Mint missing simulated yield amount
            (bool success, ) = underlyingAsset.call(abi.encodeWithSignature("mint(address,uint256)", address(this), actualAmount - currentBal));
            require(success, "Mint failed");
        }

        require(IERC20(underlyingAsset).transfer(msg.sender, actualAmount), "USDC transfer failed");
        return actualAmount;
    }

    function getBalance() public view override returns (uint256 totalUnderlying) {
        if (totalPrincipal == 0) return 0;
        uint256 timeElapsed = block.timestamp - lastUpdateTimestamp;
        uint256 pendingYield = (totalPrincipal * getAPYBps * timeElapsed) / (365 days * 10000);
        return totalPrincipal + _simulatedYieldAccrued + pendingYield;
    }

    function setAPYBps(uint256 _newApyBps) external {
        _updateAccruedYield();
        getAPYBps = _newApyBps;
    }
}
