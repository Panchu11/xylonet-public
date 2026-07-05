// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/PayXTipping.sol";
import "../src/MockUSDC.sol";

contract PayXTippingTest is Test {
    PayXTipping public payX;
    MockUSDC public usdc;

    address public owner = address(1);
    address public oracle = address(2);
    address public feeRecipient = address(3);
    address public tipper = address(4);
    address public creator = address(5);

    uint256 public constant PLATFORM_FEE_BPS = 100; // 1%
    uint256 public constant MIN_TIP_AMOUNT = 0.1 ether;

    // Oracle private key for signing
    uint256 public constant ORACLE_PRIVATE_KEY = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;

    function setUp() public {
        // Derive oracle address from private key
        oracle = vm.addr(ORACLE_PRIVATE_KEY);

        vm.startPrank(owner);
        
        // Deploy contracts
        usdc = new MockUSDC();
        payX = new PayXTipping(
            address(usdc),
            oracle,
            feeRecipient,
            PLATFORM_FEE_BPS,
            MIN_TIP_AMOUNT
        );

        vm.stopPrank();

        // Give tipper some USDC
        usdc.mint(tipper, 1000 ether);

        // Approve PayX contract
        vm.prank(tipper);
        usdc.approve(address(payX), type(uint256).max);
    }

    function testTip() public {
        vm.prank(tipper);
        payX.tip("elonmusk", 10 ether, "Great tweet!");

        // Check pending balance (minus 1% fee)
        assertEq(payX.getPendingBalance("elonmusk"), 9.9 ether);
        assertEq(payX.getTipCount("elonmusk"), 1);
    }

    function testTipNormalizesHandle() public {
        vm.prank(tipper);
        payX.tip("ElonMusk", 10 ether, "");

        // Should be normalized to lowercase
        assertEq(payX.getPendingBalance("elonmusk"), 9.9 ether);
        assertEq(payX.getPendingBalance("ElonMusk"), 9.9 ether);
    }

    function testMultipleTips() public {
        vm.startPrank(tipper);
        payX.tip("elonmusk", 10 ether, "Tip 1");
        payX.tip("elonmusk", 5 ether, "Tip 2");
        vm.stopPrank();

        // 15 USDC - 1% = 14.85 USDC
        assertEq(payX.getPendingBalance("elonmusk"), 14.85 ether);
        assertEq(payX.getTipCount("elonmusk"), 2);
    }

    function testClaimTips() public {
        // Send a tip
        vm.prank(tipper);
        payX.tip("elonmusk", 10 ether, "Great work!");

        // Generate signature for claim
        bytes32 nonce = keccak256("nonce1");
        bytes32 messageHash = keccak256(abi.encodePacked("elonmusk", creator, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ORACLE_PRIVATE_KEY, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Claim tips
        uint256 creatorBalanceBefore = usdc.balanceOf(creator);
        payX.claimTips("elonmusk", creator, nonce, signature);
        uint256 creatorBalanceAfter = usdc.balanceOf(creator);

        // Creator should receive 9.9 USDC
        assertEq(creatorBalanceAfter - creatorBalanceBefore, 9.9 ether);
        assertEq(payX.getPendingBalance("elonmusk"), 0);
        assertTrue(payX.isHandleRegistered("elonmusk"));
        assertEq(payX.getLinkedWallet("elonmusk"), creator);
    }

    function testCannotClaimWithInvalidSignature() public {
        vm.prank(tipper);
        payX.tip("elonmusk", 10 ether, "");

        bytes32 nonce = keccak256("nonce1");
        bytes memory fakeSignature = new bytes(65);

        vm.expectRevert(PayXTipping.InvalidSignature.selector);
        payX.claimTips("elonmusk", creator, nonce, fakeSignature);
    }

    function testCannotReuseNonce() public {
        vm.prank(tipper);
        payX.tip("elonmusk", 10 ether, "");

        bytes32 nonce = keccak256("nonce1");
        bytes32 messageHash = keccak256(abi.encodePacked("elonmusk", creator, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ORACLE_PRIVATE_KEY, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // First claim succeeds
        payX.claimTips("elonmusk", creator, nonce, signature);

        // Send another tip
        vm.prank(tipper);
        payX.tip("elonmusk", 5 ether, "");

        // Try to reuse nonce
        vm.expectRevert(PayXTipping.NonceAlreadyUsed.selector);
        payX.claimTips("elonmusk", creator, nonce, signature);
    }

    function testMinTipAmount() public {
        vm.prank(tipper);
        vm.expectRevert(PayXTipping.InvalidAmount.selector);
        payX.tip("elonmusk", 0.01 ether, ""); // Below minimum
    }

    function testInvalidHandle() public {
        vm.prank(tipper);
        vm.expectRevert(PayXTipping.InvalidHandle.selector);
        payX.tip("invalid@handle", 10 ether, ""); // Invalid character
    }

    function testFeeCollection() public {
        vm.prank(tipper);
        payX.tip("elonmusk", 100 ether, "");

        // 1% of 100 = 1 USDC fee
        assertEq(payX.totalFeesCollected(), 1 ether);

        // Withdraw fees
        uint256 recipientBalanceBefore = usdc.balanceOf(feeRecipient);
        payX.withdrawFees();
        uint256 recipientBalanceAfter = usdc.balanceOf(feeRecipient);

        assertEq(recipientBalanceAfter - recipientBalanceBefore, 1 ether);
        assertEq(payX.totalFeesCollected(), 0);
    }

    function testAdminFunctions() public {
        vm.startPrank(owner);

        // Update oracle signer
        address newOracle = address(10);
        payX.setOracleSigner(newOracle);
        assertEq(payX.oracleSigner(), newOracle);

        // Update platform fee
        payX.setPlatformFee(200); // 2%
        assertEq(payX.platformFeeBps(), 200);

        // Update min tip amount
        payX.setMinTipAmount(1 ether);
        assertEq(payX.minTipAmount(), 1 ether);

        // Update fee recipient
        address newRecipient = address(11);
        payX.setFeeRecipient(newRecipient);
        assertEq(payX.feeRecipient(), newRecipient);

        vm.stopPrank();
    }

    function testGetTipHistory() public {
        vm.startPrank(tipper);
        payX.tip("elonmusk", 10 ether, "Tip 1");
        payX.tip("elonmusk", 20 ether, "Tip 2");
        payX.tip("elonmusk", 30 ether, "Tip 3");
        vm.stopPrank();

        PayXTipping.Tip[] memory tips = payX.getTipHistory("elonmusk", 0, 10);
        assertEq(tips.length, 3);
        assertEq(tips[0].amount, 9.9 ether); // 10 - 1%
        assertEq(tips[1].amount, 19.8 ether); // 20 - 1%
        assertEq(tips[2].amount, 29.7 ether); // 30 - 1%
    }
}
