// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../interfaces/IERC20.sol";
import "../core/XyloERC20.sol";

/**
 * @title XyloVault
 * @notice Yield vault for stablecoins on Arc Network
 * @dev Implements ERC-4626-like vault for yield strategies
 */
contract XyloVault is XyloERC20 {
    // Underlying asset
    IERC20 public immutable asset;
    
    // Vault configuration
    address public owner;
    address public strategy;
    
    // Fees (in basis points, 1 = 0.01%)
    uint256 public depositFee = 0;
    uint256 public withdrawFee = 10; // 0.1%
    uint256 public performanceFee = 1000; // 10%
    uint256 public constant MAX_FEE = 2000; // 20%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Fee recipient
    address public feeRecipient;
    
    // Vault state
    uint256 public totalAssets;
    uint256 public lastHarvestTime;
    
    // Events
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Harvest(uint256 profit, uint256 fee);
    event StrategyUpdated(address oldStrategy, address newStrategy);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "XyloVault: FORBIDDEN");
        _;
    }
    
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _feeRecipient
    ) XyloERC20(_name, _symbol) {
        asset = _asset;
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        lastHarvestTime = block.timestamp;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Total assets under management
     */
    function totalAssetsManaged() public view returns (uint256) {
        return totalAssets;
    }
    
    /**
     * @notice Convert assets to shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? assets : (assets * supply) / totalAssets;
    }
    
    /**
     * @notice Convert shares to assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? shares : (shares * totalAssets) / supply;
    }
    
    /**
     * @notice Preview deposit
     */
    function previewDeposit(uint256 assets) public view returns (uint256) {
        uint256 fee = (assets * depositFee) / FEE_DENOMINATOR;
        return convertToShares(assets - fee);
    }
    
    /**
     * @notice Preview withdraw
     */
    function previewWithdraw(uint256 assets) public view returns (uint256) {
        uint256 fee = (assets * withdrawFee) / FEE_DENOMINATOR;
        return convertToShares(assets + fee);
    }
    
    /**
     * @notice Preview redeem
     */
    function previewRedeem(uint256 shares) public view returns (uint256) {
        uint256 assets = convertToAssets(shares);
        uint256 fee = (assets * withdrawFee) / FEE_DENOMINATOR;
        return assets - fee;
    }
    
    /**
     * @notice Max deposit for address
     */
    function maxDeposit(address) public pure returns (uint256) {
        return type(uint256).max;
    }
    
    /**
     * @notice Max withdraw for address
     */
    function maxWithdraw(address _owner) public view returns (uint256) {
        return convertToAssets(balanceOf[_owner]);
    }
    
    /**
     * @notice Max redeem for address
     */
    function maxRedeem(address _owner) public view returns (uint256) {
        return balanceOf[_owner];
    }
    
    // ============ Deposit Functions ============
    
    /**
     * @notice Deposit assets and receive shares
     */
    function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
        require(assets > 0, "XyloVault: ZERO_AMOUNT");
        require(receiver != address(0), "XyloVault: ZERO_ADDRESS");
        
        // Calculate fee
        uint256 fee = (assets * depositFee) / FEE_DENOMINATOR;
        uint256 assetsAfterFee = assets - fee;
        
        // Calculate shares
        shares = convertToShares(assetsAfterFee);
        require(shares > 0, "XyloVault: ZERO_SHARES");
        
        // Transfer assets
        asset.transferFrom(msg.sender, address(this), assets);
        
        // Transfer fee if any
        if (fee > 0) {
            asset.transfer(feeRecipient, fee);
        }
        
        // Update state
        totalAssets += assetsAfterFee;
        
        // Mint shares
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }
    
    /**
     * @notice Mint shares by depositing assets
     */
    function mint(uint256 shares, address receiver) public returns (uint256 assets) {
        require(shares > 0, "XyloVault: ZERO_SHARES");
        require(receiver != address(0), "XyloVault: ZERO_ADDRESS");
        
        // Calculate assets needed
        assets = convertToAssets(shares);
        uint256 assetsWithFee = (assets * FEE_DENOMINATOR) / (FEE_DENOMINATOR - depositFee);
        
        // Transfer assets
        asset.transferFrom(msg.sender, address(this), assetsWithFee);
        
        // Handle fee
        uint256 fee = assetsWithFee - assets;
        if (fee > 0) {
            asset.transfer(feeRecipient, fee);
        }
        
        // Update state
        totalAssets += assets;
        
        // Mint shares
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assetsWithFee, shares);
    }
    
    // ============ Withdraw Functions ============
    
    /**
     * @notice Withdraw assets by burning shares
     */
    function withdraw(uint256 assets, address receiver, address _owner) public returns (uint256 shares) {
        require(assets > 0, "XyloVault: ZERO_AMOUNT");
        require(receiver != address(0), "XyloVault: ZERO_ADDRESS");
        
        shares = previewWithdraw(assets);
        
        // Check allowance if not owner
        if (msg.sender != _owner) {
            uint256 allowed = allowance[_owner][msg.sender];
            if (allowed != type(uint256).max) {
                require(allowed >= shares, "XyloVault: INSUFFICIENT_ALLOWANCE");
                allowance[_owner][msg.sender] = allowed - shares;
            }
        }
        
        require(balanceOf[_owner] >= shares, "XyloVault: INSUFFICIENT_BALANCE");
        
        // Calculate fee
        uint256 fee = (assets * withdrawFee) / FEE_DENOMINATOR;
        
        // Burn shares
        _burn(_owner, shares);
        
        // Update state
        totalAssets -= (assets + fee);
        
        // Transfer assets
        asset.transfer(receiver, assets);
        
        // Transfer fee
        if (fee > 0) {
            asset.transfer(feeRecipient, fee);
        }
        
        emit Withdraw(msg.sender, receiver, _owner, assets, shares);
    }
    
    /**
     * @notice Redeem shares for assets
     */
    function redeem(uint256 shares, address receiver, address _owner) public returns (uint256 assets) {
        require(shares > 0, "XyloVault: ZERO_SHARES");
        require(receiver != address(0), "XyloVault: ZERO_ADDRESS");
        
        // Check allowance if not owner
        if (msg.sender != _owner) {
            uint256 allowed = allowance[_owner][msg.sender];
            if (allowed != type(uint256).max) {
                require(allowed >= shares, "XyloVault: INSUFFICIENT_ALLOWANCE");
                allowance[_owner][msg.sender] = allowed - shares;
            }
        }
        
        require(balanceOf[_owner] >= shares, "XyloVault: INSUFFICIENT_BALANCE");
        
        assets = previewRedeem(shares);
        
        // Calculate fee
        uint256 grossAssets = convertToAssets(shares);
        uint256 fee = grossAssets - assets;
        
        // Burn shares
        _burn(_owner, shares);
        
        // Update state
        totalAssets -= grossAssets;
        
        // Transfer assets
        asset.transfer(receiver, assets);
        
        // Transfer fee
        if (fee > 0) {
            asset.transfer(feeRecipient, fee);
        }
        
        emit Withdraw(msg.sender, receiver, _owner, assets, shares);
    }
    
    // ============ Strategy Functions ============
    
    /**
     * @notice Harvest profits from strategy
     */
    function harvest() external returns (uint256 profit) {
        // Calculate profit (simplified - in production would interact with strategy)
        uint256 currentBalance = asset.balanceOf(address(this));
        
        if (currentBalance > totalAssets) {
            profit = currentBalance - totalAssets;
            
            // Take performance fee
            uint256 fee = (profit * performanceFee) / FEE_DENOMINATOR;
            
            if (fee > 0) {
                asset.transfer(feeRecipient, fee);
                profit -= fee;
            }
            
            // Update total assets
            totalAssets = currentBalance - fee;
            
            lastHarvestTime = block.timestamp;
            
            emit Harvest(profit, fee);
        }
    }
    
    // ============ Admin Functions ============
    
    function setStrategy(address _strategy) external onlyOwner {
        address oldStrategy = strategy;
        strategy = _strategy;
        emit StrategyUpdated(oldStrategy, _strategy);
    }
    
    function setFees(uint256 _depositFee, uint256 _withdrawFee, uint256 _performanceFee) external onlyOwner {
        require(_depositFee <= MAX_FEE, "XyloVault: FEE_TOO_HIGH");
        require(_withdrawFee <= MAX_FEE, "XyloVault: FEE_TOO_HIGH");
        require(_performanceFee <= MAX_FEE, "XyloVault: FEE_TOO_HIGH");
        
        depositFee = _depositFee;
        withdrawFee = _withdrawFee;
        performanceFee = _performanceFee;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "XyloVault: ZERO_ADDRESS");
        feeRecipient = _feeRecipient;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "XyloVault: ZERO_ADDRESS");
        owner = newOwner;
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}
