import { Router, Request, Response } from "express";
import { ethers } from "ethers";

const router = Router();

/**
 * POST /api/claim/sign
 * Generate signature for claiming tips
 * Requires authenticated session with Twitter
 */
router.post("/sign", async (req: Request, res: Response) => {
  try {
    // Verify user is authenticated
    const handle = req.session.twitterHandle;
    if (!handle) {
      res.status(401).json({ error: "Not authenticated with Twitter" });
      return;
    }
    
    const { walletAddress } = req.body;
    
    // Validate wallet address
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      res.status(400).json({ error: "Invalid wallet address" });
      return;
    }
    
    // Normalize handle to lowercase
    const normalizedHandle = handle.toLowerCase();
    
    // Generate unique nonce
    const nonce = ethers.keccak256(
      ethers.toUtf8Bytes(`${normalizedHandle}-${walletAddress}-${Date.now()}-${Math.random()}`)
    );
    
    // Create message hash (must match contract's verification)
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "address", "bytes32"],
      [normalizedHandle, walletAddress, nonce]
    );
    
    // Sign with oracle private key
    const oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!oraclePrivateKey) {
      res.status(500).json({ error: "Oracle not configured" });
      return;
    }
    
    const wallet = new ethers.Wallet(oraclePrivateKey);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    
    res.json({
      success: true,
      data: {
        handle: normalizedHandle,
        walletAddress,
        nonce,
        signature,
        oracleAddress: wallet.address,
      },
    });
  } catch (error) {
    console.error("Claim sign error:", error);
    res.status(500).json({ error: "Failed to generate claim signature" });
  }
});

/**
 * GET /api/claim/verify
 * Verify a claim signature (for testing)
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { handle, walletAddress, nonce, signature } = req.body;
    
    // Normalize handle
    const normalizedHandle = handle.toLowerCase();
    
    // Recreate message hash
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "address", "bytes32"],
      [normalizedHandle, walletAddress, nonce]
    );
    
    // Recover signer
    const recoveredAddress = ethers.verifyMessage(
      ethers.getBytes(messageHash),
      signature
    );
    
    // Check if it matches oracle
    const oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!oraclePrivateKey) {
      res.status(500).json({ error: "Oracle not configured" });
      return;
    }
    
    const expectedOracle = new ethers.Wallet(oraclePrivateKey).address;
    const isValid = recoveredAddress.toLowerCase() === expectedOracle.toLowerCase();
    
    res.json({
      valid: isValid,
      recoveredAddress,
      expectedOracle,
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "Failed to verify signature" });
  }
});

export const claimRoutes = router;
