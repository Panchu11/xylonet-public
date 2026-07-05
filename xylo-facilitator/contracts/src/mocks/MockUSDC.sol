// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC with EIP-3009 transferWithAuthorization for testing
 */
contract MockUSDC is ERC20 {
    uint8 private constant _DECIMALS = 6;

    // EIP-3009: track used nonces
    mapping(address => mapping(bytes32 => bool)) private _authorizationStates;

    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Mock EIP-3009 transferWithAuthorization
     * @dev In production, this verifies EIP-712 typed signatures.
     *      For testing, we skip signature verification and just execute the transfer.
     */
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8, // v
        bytes32, // r
        bytes32 // s
    ) external {
        require(block.timestamp > validAfter, "Authorization not yet valid");
        require(block.timestamp < validBefore, "Authorization expired");
        require(!_authorizationStates[from][nonce], "Authorization already used");

        _authorizationStates[from][nonce] = true;
        _transfer(from, to, value);

        emit AuthorizationUsed(from, nonce);
    }

    function authorizationState(address authorizer, bytes32 nonce) external view returns (bool) {
        return _authorizationStates[authorizer][nonce];
    }
}
