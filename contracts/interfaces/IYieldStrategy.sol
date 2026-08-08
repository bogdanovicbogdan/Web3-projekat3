// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IYieldStrategy
 * @notice Standard interface for yield strategies integrated with FHEYieldPayrollVault.
 * Allows swapping between Aave v3, Morpho, RWA T-Bills, or Mock High-Yield strategies.
 */
interface IYieldStrategy {
    /**
     * @notice Deposit underlying asset into the yield strategy
     * @param amount Amount of underlying asset (e.g., USDC) to deposit
     * @return shares Amount of strategy shares minted
     */
    function deposit(uint256 amount) external returns (uint256 shares);

    /**
     * @notice Withdraw underlying asset from the yield strategy
     * @param amount Amount of underlying asset to withdraw
     * @return actualAmount Amount actually withdrawn and transferred back
     */
    function withdraw(uint256 amount) external returns (uint256 actualAmount);

    /**
     * @notice Get total underlying balance managed by this strategy (principal + accrued yield)
     */
    function getBalance() external view returns (uint256 totalUnderlying);

    /**
     * @notice Return human-readable strategy name
     */
    function strategyName() external view returns (string memory);

    /**
     * @notice Return current estimated annual percentage yield (in basis points, e.g. 650 = 6.50%)
     */
    function getAPYBps() external view returns (uint256 apyBps);
}
