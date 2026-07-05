import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "PayX API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    network: "Arc Testnet",
  });
});

router.get("/ready", (req, res) => {
  // Check if all required env vars are set
  const requiredEnvVars = [
    "TWITTER_CLIENT_ID",
    "TWITTER_CLIENT_SECRET",
    "ORACLE_PRIVATE_KEY",
    "PAYX_CONTRACT_ADDRESS",
  ];
  
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    res.status(503).json({
      status: "not_ready",
      missing: missing,
    });
    return;
  }
  
  res.json({ status: "ready" });
});

export const healthRoutes = router;
