# MultiAssetVault - ERC4626 Strategy Vault

A sophisticated ERC4626-compliant vault that accepts USDC deposits and automatically allocates funds across 3 different assets according to predefined weights with automatic rebalancing capabilities.

## 🎯 Overview

The `MultiAssetVault` is a tokenized strategy vault that:
- Accepts USDC deposits from users
- Automatically allocates deposits across 3 predefined assets based on target weights
- Implements automatic rebalancing when asset weights deviate from targets
- Provides ERC4626 standard compliance for maximum compatibility
- Includes comprehensive security features and fee management

## 🏗️ Architecture

### Key Components

1. **ERC4626 Standard Compliance**: Full implementation of the tokenized vault standard
2. **Multi-Asset Portfolio**: Supports exactly 3 different assets with configurable weights
3. **Automatic Rebalancing**: Triggers rebalancing when asset weights deviate by >5%
4. **DEX Integration**: Uses aggregators (1inch, Uniswap) for optimal swap execution
5. **Price Oracle Integration**: Chainlink-compatible oracle for accurate asset pricing
6. **Security Features**: ReentrancyGuard, Pausable, access controls, emergency functions

### Portfolio Configuration Example

```solidity
// Example: 40% WETH, 30% cbETH, 30% USDbC
address[3] portfolioTokens = [WETH, CBETH, USDBC];
uint256[3] weights = [4000, 3000, 3000]; // Basis points (10,000 = 100%)
```

## 🔧 Features

### Core Functionality
- **Deposit**: Users deposit USDC and receive vault shares
- **Withdraw**: Users burn shares to withdraw proportional USDC value
- **Rebalancing**: Automatic portfolio rebalancing based on target weights
- **Fee Management**: Configurable deposit, withdrawal, management, and performance fees

### Security Features
- **Access Control**: Owner-only administrative functions
- **Pausable**: Emergency pause capability
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Emergency Withdrawal**: Owner can recover funds in emergencies

### Advanced Features
- **Slippage Protection**: 2% maximum slippage on swaps
- **Gas Optimization**: Batch operations and efficient storage
- **Real-time Metrics**: Portfolio composition and performance tracking
- **Customizable Weights**: Owner can adjust asset allocation weights

## 📋 Contract Interface

### ERC4626 Standard Functions
```solidity
function deposit(uint256 assets, address receiver) external returns (uint256 shares);
function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
function mint(uint256 shares, address receiver) external returns (uint256 assets);
function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
```

### Custom Functions
```solidity
function rebalance() external;
function shouldRebalance() external view returns (bool);
function getPortfolioComposition() external view returns (address[3], uint256[3], uint256[3], uint256[3]);
function getVaultMetrics() external view returns (uint256, uint256, uint256, uint256, bool);
```

### Administrative Functions
```solidity
function updateAssetWeight(uint8 assetIndex, uint256 newWeight) external onlyOwner;
function updateFees(uint256 mgmt, uint256 perf, uint256 deposit, uint256 withdrawal) external onlyOwner;
function pause() external onlyOwner;
function emergencyWithdraw(address token, uint256 amount) external onlyOwner;
```

## 🚀 Deployment Guide

### Prerequisites
```bash
npm install @openzeppelin/contracts hardhat ethers
```

### Deployment Script
```javascript
// Deploy with custom parameters
const vault = await MultiAssetVault.deploy(
    USDC_ADDRESS,                    // Base asset (USDC)
    "Multi-Asset Strategy Vault",    // Vault name
    "MASV",                         // Vault symbol
    [WETH, CBETH, USDBC],          // Portfolio tokens
    [4000, 3000, 3000],            // Weights (40%, 30%, 30%)
    PRICE_ORACLE_ADDRESS,           // Price oracle
    DEX_AGGREGATOR_ADDRESS,         // DEX aggregator
    FEE_RECIPIENT_ADDRESS           // Fee recipient
);
```

### Configuration Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `_asset` | Base asset (USDC) address | `0xA0b86a33E6441ad...` |
| `_portfolioTokens` | Array of 3 asset addresses | `[WETH, cbETH, USDbC]` |
| `_weights` | Array of 3 weights in basis points | `[4000, 3000, 3000]` |
| `_priceOracle` | Price oracle contract address | Chainlink-compatible |
| `_dexAggregator` | DEX aggregator for swaps | 1inch, Uniswap Router |
| `_feeRecipient` | Address to receive fees | Treasury address |

## 💡 Usage Examples

### User Deposit Flow
```javascript
// 1. User approves USDC spending
await usdc.approve(vaultAddress, depositAmount);

// 2. Preview expected shares
const expectedShares = await vault.previewDeposit(depositAmount);

// 3. Execute deposit
const shares = await vault.deposit(depositAmount, userAddress);
```

### User Withdrawal Flow
```javascript
// 1. Preview withdrawal amount
const expectedAssets = await vault.previewRedeem(shareAmount);

// 2. Execute withdrawal
const assets = await vault.redeem(shareAmount, userAddress, userAddress);
```

### Rebalancing
```javascript
// Check if rebalancing is needed
const needsRebalance = await vault.shouldRebalance();

if (needsRebalance) {
    // Execute rebalancing
    await vault.rebalance();
}
```

## 📊 Monitoring & Analytics

### Portfolio Composition
```javascript
const composition = await vault.getPortfolioComposition();
// Returns: tokens[], balances[], values[], currentWeights[]
```

### Vault Metrics
```javascript
const metrics = await vault.getVaultMetrics();
// Returns: totalAssets, totalSupply, sharePrice, lastRebalance, needsRebalance
```

### Performance Tracking
- **Share Price**: Track vault performance over time
- **Total Value Locked**: Monitor vault adoption
- **Rebalancing Frequency**: Assess market volatility impact
- **Fee Collection**: Revenue tracking

## ⚙️ Configuration Options

### Fee Structure
| Fee Type | Default | Maximum | Description |
|----------|---------|---------|-------------|
| Management | 1.0% | 5.0% | Annual management fee |
| Performance | 10.0% | 20.0% | Fee on profits |
| Deposit | 0.5% | 1.0% | One-time deposit fee |
| Withdrawal | 0.5% | 1.0% | One-time withdrawal fee |

### Security Limits
- **Max Deposit**: 1M USDC per transaction
- **Max Total Assets**: 10M USDC vault capacity
- **Slippage Protection**: 2% maximum slippage
- **Rebalance Threshold**: 5% weight deviation trigger

## 🔒 Security Considerations

### Auditing Checklist
- [ ] Oracle price manipulation resistance
- [ ] DEX aggregator integration security
- [ ] Reentrancy attack protection
- [ ] Access control implementation
- [ ] Emergency pause functionality
- [ ] Fee calculation accuracy
- [ ] Share price manipulation resistance

### Risk Mitigation
1. **Oracle Failures**: Implement circuit breakers and fallback oracles
2. **DEX Liquidity**: Monitor liquidity before large swaps
3. **Smart Contract Risk**: Comprehensive testing and audits
4. **Governance Risk**: Implement timelock for parameter changes

## 🧪 Testing

### Unit Tests
```javascript
describe("MultiAssetVault", function() {
    it("Should accept USDC deposits", async function() {
        // Test deposit functionality
    });
    
    it("Should allocate assets correctly", async function() {
        // Test asset allocation logic
    });
    
    it("Should rebalance when needed", async function() {
        // Test rebalancing mechanism
    });
});
```

### Integration Tests
- Test with real DEX aggregators
- Test with live price oracles
- Test rebalancing under various market conditions
- Test emergency scenarios

## 📈 Use Cases

### Individual Users
- **Diversified Exposure**: Get exposure to multiple assets with single deposit
- **Automated Management**: No need to manually rebalance portfolio
- **Yield Generation**: Earn fees through optimal asset allocation

### Institutional Users
- **Treasury Management**: Diversify treasury holdings automatically
- **Risk Management**: Controlled exposure with defined asset weights
- **Compliance**: ERC4626 standard ensures regulatory compatibility

### Integration Partners
- **DeFi Protocols**: Integrate as yield-bearing collateral
- **Wallet Providers**: Offer as investment product
- **Robo-Advisors**: Use as building block for automated strategies

## 🛠️ Development Roadmap

### Phase 1: Core Implementation ✅
- ERC4626 compliance
- Multi-asset allocation
- Basic rebalancing

### Phase 2: Advanced Features 🔄
- Dynamic weight adjustment
- Performance fee optimization
- Advanced rebalancing strategies

### Phase 3: Integration & Scaling 📋
- Multi-chain deployment
- Additional asset support
- Institutional features

## 📞 Support & Contributing

For questions, issues, or contributions:
- Open GitHub issues for bugs
- Submit pull requests for improvements
- Join Discord for development discussions

## ⚖️ License

MIT License - See LICENSE file for details

---

**Disclaimer**: This code is provided for educational purposes. Conduct thorough testing and auditing before deploying to mainnet. 