require('dotenv').config();

// ── Environment variable validation ───────────────────────
// Fail fast on missing critical config before starting the server
const requiredEnvVars = ['SETTLEMENT_PRIVATE_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingEnv = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnv.length > 0) {
  console.error('[FATAL] Missing required environment variables:', missingEnv.join(', '));
  console.error('[FATAL] Server cannot start. Check your .env configuration.');
  process.exit(1);
}

// JWT_SECRET: required in production, warn in development
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL] JWT_SECRET is required in production environment.');
    process.exit(1);
  } else {
    console.warn('[WARN] JWT_SECRET is not set — JWT authentication will not work.');
  }
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const { createIpRateLimiter } = require('./middleware/rate-limit');
const { arcTestnet } = require('./utils/arc');

// Routes
const facilitatorRoutes = require('./routes/facilitator');
const developerRoutes = require('./routes/developer');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');

// BigInt-safe JSON serialization
BigInt.prototype.toJSON = function() { return this.toString(); };

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client (with fallback if unavailable)
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    console.log('[DB] Supabase connected');
  }
} catch (e) {
  console.log('[DB] Supabase unavailable, running without persistence');
}

// Make supabase available to all routes (null-safe)
app.locals.supabase = supabase;

// CORS configuration — driven by CORS_ORIGINS env var (comma-separated)
// Falls back to sensible defaults when not set
const isProduction = process.env.NODE_ENV === 'production';
const devCorsOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const prodCorsOrigins = ['https://xylonet.xyz', 'https://www.xylonet.xyz'];

let corsOrigins;
if (process.env.CORS_ORIGINS) {
  corsOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
} else if (isProduction) {
  console.warn('[CORS] CORS_ORIGINS not set — using production defaults. Set CORS_ORIGINS explicitly in production.');
  corsOrigins = prodCorsOrigins;
} else {
  corsOrigins = devCorsOrigins;
}

// Request tracing — correlation IDs for all requests
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'XyloFacilitator',
    version: '1.0.0',
    network: arcTestnet.name,
    chainId: arcTestnet.id,
    uptime: process.uptime()
  });
});

// API routes
app.use('/health', healthRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/facilitator', facilitatorRoutes);
app.use('/v1/developer', developerRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/agent', require('./routes/faucet'));

// x402 payment proxy middleware - intercepts HTTP 402 responses
// and handles payment negotiation automatically
// IP-based rate limit: 100 requests/minute before proxy handler
app.use('/v1/proxy', createIpRateLimiter({ max: 100 }), require('./middleware/x402-proxy'));

// Error handler — never leak internal error details to client
app.use((err, req, res, next) => {
  console.error(`[ERROR] requestId=${req.requestId || 'unknown'}`, err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    requestId: req.requestId
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║       XyloFacilitator v1.0.0 on Arc         ║
║       Hosted x402 Facilitator-as-a-Service   ║
╠══════════════════════════════════════════════╣
║  Port:     ${PORT}                              ║
║  Network:  Arc Testnet (5042002)              ║
║  RPC:      ${process.env.ARC_RPC_URL}  ║
║  USDC:     ${process.env.USDC_ADDRESS}  ║
║  Fee:      ${process.env.FACILITATOR_FEE_BPS / 100}%                              ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
