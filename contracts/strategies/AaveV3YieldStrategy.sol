// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IYieldStrategy.sol";

interface IAaveV3Pool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title AaveV3YieldStrategy
 * @notice Real Aave v3 adapter for supplying USDC to Aave v3 Pool (compatible with Tenderly Mainnet Fork)
 */
contract AaveV3YieldStrategy is IYieldStrategy {
    address public immutable underlyingAsset; // e.g. USDC Mainnet (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)
    address public immutable aToken;          // e.g. aEthUSDC (0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c)
    address public immutable aavePool;        // Aave v3 Pool (0x87870Bca3F5f72355b29375179BfcB4B914A6F5e)

    string public override strategyName = "Aave v3 Core USDC Pool";

    constructor(address _underlyingAsset, address _aToken, address _aavePool) {
        underlyingAsset = _underlyingAsset;
        aToken = _aToken;
        aavePool = _aavePool;
    }

    function deposit(uint256 amount) external override returns (uint256 shares) {
        IERC20Minimal(underlyingAsset).approve(aavePool, amount);
        IAaveV3Pool(aavePool).supply(underlyingAsset, amount, address(this), 0);
        return amount;
    }

    function withdraw(uint256 amount) external override returns (uint256 actualAmount) {
        return IAaveV3Pool(aavePool).withdraw(underlyingAsset, amount, msg.sender);
    }

    function getBalance() public view override returns (uint256 totalUnderlying) {
        return IERC20Minimal(aToken).balanceOf(address(this));
    }

    function getAPYBps() external view override returns (uint256 apyBps) {
        // Return 650 basis points (6.50% APY estimate for Aave v3 USDC)
        return 650;
    }
}
