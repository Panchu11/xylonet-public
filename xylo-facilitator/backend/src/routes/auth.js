const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { verifyMessage } = require('viem');
const { publicClient } = require('../utils/arc');

// In-memory nonce store with TTL (5 min)
const nonceStore = new Map();
const NONCE_TTL = 5 * 60 * 1000;

// JWT helper (simple HMAC-based tokens)
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  console.warn('[AUTH] WARNING: JWT_SECRET not set. Using insecure dev fallback. Set JWT_SECRET in .env for production.');
}

const SIGNING_SECRET = JWT_SECRET || 'xylofacilitator-dev-secret-DO-NOT-USE-IN-PRODUCTION';

function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SIGNING_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', SIGNING_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Cleanup expired nonces periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, { createdAt }] of nonceStore) {
    if (now - createdAt > NONCE_TTL) nonceStore.delete(key);
  }
}, 60000);

/**
 * POST /v1/auth/siwe/challenge
 * Generate a SIWE challenge message for wallet sign-in
 */
router.post('/siwe/challenge', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Valid Ethereum address is required' });
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    const expirationTime = new Date(Date.now() + NONCE_TTL).toISOString();

    // SIWE formatted message (EIP-4361)
    const message = [
      'xylonet.xyz wants you to sign in with your Ethereum account:',
      address,
      '',
      'Sign in to XyloFacilitator Developer Portal',
      '',
      `URI: https://xylonet.xyz`,
      'Version: 1',
      `Chain ID: 5042002`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`,
      `Expiration Time: ${expirationTime}`,
    ].join('\n');

    // Store nonce
    nonceStore.set(nonce, { address: address.toLowerCase(), createdAt: Date.now() });

    res.json({ message, nonce });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /v1/auth/siwe/verify
 * Verify SIWE signature and issue auth token
 */
router.post('/siwe/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;

    if (!message || !signature) {
      return res.status(400).json({ error: 'message and signature are required' });
    }

    // Extract nonce and address from message
    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/);
    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);

    if (!nonceMatch || !addressMatch) {
      return res.status(400).json({ error: 'Invalid SIWE message format' });
    }

    const nonce = nonceMatch[1];
    const address = addressMatch[0];

    // Verify nonce exists and matches
    const storedNonce = nonceStore.get(nonce);
    if (!storedNonce) {
      return res.status(401).json({ error: 'Nonce expired or invalid' });
    }

    if (storedNonce.address !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Address mismatch' });
    }

    // Verify signature
    const valid = await verifyMessage({
      address,
      message,
      signature,
    });

    if (!valid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Consume nonce (one-time use)
    nonceStore.delete(nonce);

    // Upsert developer by wallet address
    const supabase = req.app.locals.supabase;
    let developer;

    const { data: existing } = await supabase
      .from('xf_developers')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single();

    if (existing) {
      developer = existing;
    } else {
      // Auto-register developer on first SIWE sign-in
      const apiKey = `xyl_${crypto.randomBytes(16).toString('hex')}`;
      const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

      const { data: newDev, error } = await supabase
        .from('xf_developers')
        .insert({
          wallet_address: address.toLowerCase(),
          email: `${address.toLowerCase().slice(0, 10)}@wallet.xylonet.xyz`,
          api_key: hashedKey,
          plan: 'free',
          rate_limit_rpm: 60,
          monthly_volume_limit_usd: 1000
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      developer = newDev;
      // Return the raw API key only on first registration
      developer._newApiKey = apiKey;
    }

    // Issue JWT
    const token = createToken({
      sub: developer.id,
      address: address.toLowerCase(),
    });

    res.json({
      token,
      developer: {
        id: developer.id,
        email: developer.email,
        name: developer.name,
        walletAddress: developer.wallet_address,
        plan: developer.plan,
        ...(developer._newApiKey ? { apiKey: developer._newApiKey } : {})
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /v1/auth/session
 * Get current session from JWT token
 */
router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const supabase = req.app.locals.supabase;
    const { data: developer } = await supabase
      .from('xf_developers')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (!developer) {
      return res.status(401).json({ error: 'Developer not found' });
    }

    res.json({
      developer: {
        id: developer.id,
        email: developer.email,
        name: developer.name,
        company: developer.company,
        walletAddress: developer.wallet_address,
        plan: developer.plan,
        rateLimitRpm: developer.rate_limit_rpm,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /v1/auth/session
 * Logout (client-side token removal, server acknowledges)
 */
router.delete('/session', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Export token verification for use in other routes
router.verifyToken = verifyToken;
module.exports = router;
