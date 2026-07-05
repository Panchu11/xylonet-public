import { Router, Request, Response } from "express";
import { ethers } from "ethers";

const router = Router();

// Arc Testnet RPC
const getProvider = () => {
  const rpcUrl = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpcUrl);
};

// PayX Contract ABI (minimal for reading)
const PAYX_ABI = [
  "function getPendingBalance(string calldata handle) external view returns (uint256)",
  "function getHandleInfo(string calldata handle) external view returns (tuple(uint256 pendingBalance, address linkedWallet, bool isRegistered, uint256 totalReceived, uint256 totalClaimed, uint256 tipCount))",
  "function getTipHistory(string calldata handle, uint256 offset, uint256 limit) external view returns (tuple(address tipper, uint256 amount, uint256 timestamp, string message)[])",
  "function getLinkedWallet(string calldata handle) external view returns (address)",
  "function isHandleRegistered(string calldata handle) external view returns (bool)",
];

// Get contract instance
const getContract = () => {
  const contractAddress = process.env.PAYX_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("PAYX_CONTRACT_ADDRESS not configured");
  }
  return new ethers.Contract(contractAddress, PAYX_ABI, getProvider());
};

/**
 * GET /api/tips/:handle
 * Get tip information for an X handle
 */
router.get("/:handle", async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const normalizedHandle = handle.toLowerCase();
    
    const contract = getContract();
    
    // Get handle info
    const info = await contract.getHandleInfo(normalizedHandle);
    
    res.json({
      handle: normalizedHandle,
      pendingBalance: ethers.formatUnits(info.pendingBalance, 18),
      pendingBalanceRaw: info.pendingBalance.toString(),
      linkedWallet: info.linkedWallet,
      isRegistered: info.isRegistered,
      totalReceived: ethers.formatUnits(info.totalReceived, 18),
      totalClaimed: ethers.formatUnits(info.totalClaimed, 18),
      tipCount: Number(info.tipCount),
    });
  } catch (error: any) {
    console.error("Get tips error:", error);
    
    // Handle contract not deployed
    if (error.message?.includes("not configured")) {
      res.status(503).json({ error: "Contract not configured" });
      return;
    }
    
    res.status(500).json({ error: "Failed to fetch tip data" });
  }
});

/**
 * GET /api/tips/:handle/history
 * Get tip history for an X handle
 */
router.get("/:handle/history", async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const normalizedHandle = handle.toLowerCase();
    const contract = getContract();
    
    // Get tip history
    const tips = await contract.getTipHistory(normalizedHandle, offset, limit);
    
    const formattedTips = tips.map((tip: any) => ({
      tipper: tip.tipper,
      amount: ethers.formatUnits(tip.amount, 18),
      amountRaw: tip.amount.toString(),
      timestamp: Number(tip.timestamp),
      date: new Date(Number(tip.timestamp) * 1000).toISOString(),
      message: tip.message,
    }));
    
    res.json({
      handle: normalizedHandle,
      offset,
      limit,
      tips: formattedTips,
    });
  } catch (error: any) {
    console.error("Get tip history error:", error);
    res.status(500).json({ error: "Failed to fetch tip history" });
  }
});

/**
 * GET /api/tips/:handle/check
 * Quick check if handle has pending tips
 */
router.get("/:handle/check", async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const normalizedHandle = handle.toLowerCase();
    
    const contract = getContract();
    const balance = await contract.getPendingBalance(normalizedHandle);
    
    res.json({
      handle: normalizedHandle,
      hasPendingTips: balance > 0n,
      pendingBalance: ethers.formatUnits(balance, 18),
    });
  } catch (error) {
    console.error("Check tips error:", error);
    res.status(500).json({ error: "Failed to check tips" });
  }
});

export const tipsRoutes = router;
