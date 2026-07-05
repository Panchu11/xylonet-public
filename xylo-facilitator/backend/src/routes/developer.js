const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { publicClient, walletClient, CONTRACTS, USDC_ABI } = require('../utils/arc');
const authRouter = require('./auth');

// Hash API key for storage/comparison
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * IP-based rate limiter for developer registration
 * Limits to 10 registrations per IP address per hour
 * Uses an in-memory sliding window (consistent with middleware/rate-limit.js)
 */
const registrationWindows = new Map();
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const REGISTRATION_LIMIT = 10;

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, { windowStart }] of registrationWindows) {
    if (now - windowStart > REGISTRATION_WINDOW_MS * 2) registrationWindows.delete(key);
  }
}, 10 * 60 * 1000);

function checkRegistrationRateLimit(ip) {
  const now = Date.now();
  let window = registrationWindows.get(ip);
  if (!window || now - window.windowStart > REGISTRATION_WINDOW_MS) {
    window = { count: 0, windowStart: now };
    registrationWindows.set(ip, window);
  }
  window.count++;
  if (window.count > REGISTRATION_LIMIT) {
    const retryAfter = Math.ceil((window.windowStart + REGISTRATION_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}

/**
 * Validate target URL to prevent SSRF attacks
 * Rejects private IPs, localhost, and non-HTTPS in production
 */
function validateTargetUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Protocol check
  const allowHttp = process.env.NODE_ENV !== 'production';
  if (parsed.protocol !== 'https:' && !(allowHttp && parsed.protocol === 'http:')) {
    return { valid: false, error: 'Only HTTPS URLs are allowed' };
  }

  // Hostname blocklist
  const blockedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'];
  const hostname = parsed.hostname.toLowerCase();
  if (blockedHostnames.includes(hostname)) {
    return { valid: false, error: 'Internal/localhost URLs are not allowed' };
  }

  // Block .local and .internal TLDs
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, error: 'Internal domain URLs are not allowed' };
  }

  // Block private IP ranges
  const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [, a, b] = ipMatch.map(Number);
    if (a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) || (a === 169 && b === 254) || a === 0) {
      return { valid: false, error: 'Private/internal IP addresses are not allowed' };
    }
  }

  return { valid: true };
}

/**
 * Unified auth middleware - accepts JWT (portal) or API key (programmatic)
 * Priority: x-api-key header > Bearer JWT > Bearer API key
 */
const authenticate = async (req, res, next) => {
  const supabase = req.app.locals.supabase;
  const apiKeyHeader = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!apiKeyHeader && !bearerToken) {
    return res.status(401).json({ error: 'Authentication required. Use x-api-key header or Bearer token.' });
  }

  // 1. If x-api-key is provided, use API key auth directly
  if (apiKeyHeader) {
    const hashedKey = hashApiKey(apiKeyHeader);
    const { data, error } = await supabase
      .from('xf_developers')
      .select('*')
      .eq('api_key', hashedKey)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    req.developer = data;
    return next();
  }

  // 2. Bearer token: try JWT first (from portal SIWE login)
  const jwtPayload = authRouter.verifyToken(bearerToken);
  if (jwtPayload && jwtPayload.sub) {
    const { data, error } = await supabase
      .from('xf_developers')
      .select('*')
      .eq('id', jwtPayload.sub)
      .single();

    if (data) {
      req.developer = data;
      return next();
    }
  }

  // 3. Fallback: treat Bearer value as an API key
  const hashedKey = hashApiKey(bearerToken);
  const { data, error } = await supabase
    .from('xf_developers')
    .select('*')
    .eq('api_key', hashedKey)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Invalid token or API key' });
  }
  req.developer = data;
  next();
};

/**
 * POST /v1/developer/register
 * Register as a developer to use XyloFacilitator
 */
router.post('/register', async (req, res) => {
  try {
    // IP-based rate limiting: max 10 registrations per IP per hour
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const rateCheck = checkRegistrationRateLimit(ip);
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter));
      return res.status(429).json({
        error: 'Too many registration attempts from this IP. Please try again later.',
        retryAfterSeconds: rateCheck.retryAfter
      });
    }

    const { email, name, company, walletAddress } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const supabase = req.app.locals.supabase;
    const apiKey = `xyl_${uuidv4().replace(/-/g, '')}`;
    const hashedKey = hashApiKey(apiKey);

    const { data, error } = await supabase
      .from('xf_developers')
      .insert({
        email,
        name: name || null,
        company: company || null,
        wallet_address: walletAddress || null,
        api_key: hashedKey,
        plan: 'free',
        rate_limit_rpm: 60,
        monthly_volume_limit_usd: 1000
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error('[Developer Route Error]', error);
      return res.status(500).json({ error: 'Operation failed' });
    }

    res.status(201).json({
      message: 'Developer registered successfully',
      developer: {
        id: data.id,
        email: data.email,
        name: data.name,
        apiKey: apiKey,
        plan: data.plan,
        walletAddress: data.wallet_address
      },
      endpoints: {
        createRoute: 'POST /v1/developer/routes',
        listRoutes: 'GET /v1/developer/routes',
        analytics: 'GET /v1/developer/analytics',
        docs: 'GET /v1/developer/docs'
      }
    });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * GET /v1/developer/me
 * Get developer profile
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({ developer: req.developer });
});

/**
 * POST /v1/developer/routes
 * Create a new API route with pricing
 */
router.post('/routes', authenticate, async (req, res) => {
  try {
    const { routePath, targetUrl, method, priceUsd, priceUnit, description } = req.body;

    if (!routePath || !targetUrl) {
      return res.status(400).json({ error: 'routePath and targetUrl are required' });
    }

    // Validate target URL to prevent SSRF
    const urlCheck = validateTargetUrl(targetUrl);
    if (!urlCheck.valid) {
      return res.status(400).json({ error: urlCheck.error });
    }

    const supabase = req.app.locals.supabase;

    // Enforce maximum routes per developer
    const { count: existingRouteCount, error: countError } = await supabase
      .from('xf_api_routes')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', req.developer.id);

    if (countError) {
      return res.status(500).json({ error: countError.message });
    }

    if (existingRouteCount >= 20) {
      return res.status(400).json({ error: 'Maximum route limit reached (20)' });
    }

    const { data, error } = await supabase
      .from('xf_api_routes')
      .insert({
        developer_id: req.developer.id,
        route_path: routePath,
        target_url: targetUrl,
        method: method || 'GET',
        price_usd: priceUsd || 0.01,
        price_unit: priceUnit || 'per_call',
        description: description || null
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Route already exists' });
      }
      console.error('[Developer Route Error]', error);
      return res.status(500).json({ error: 'Operation failed' });
    }

    res.status(201).json({
      message: 'Route created. AI agents can now pay to access this endpoint.',
      route: {
        id: data.id,
        routePath: data.route_path,
        targetUrl: data.target_url,
        method: data.method,
        priceUsd: data.price_usd,
        priceUnit: data.price_unit,
        description: data.description,
        isActive: data.is_active,
        x402Endpoint: `https://api.xylonet.xyz/v1/proxy/${data.route_path}`
      }
    });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * GET /v1/developer/routes
 * List all developer's API routes
 */
router.get('/routes', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data, error } = await supabase
      .from('xf_api_routes')
      .select('*')
      .eq('developer_id', req.developer.id)
      .order('created_at', { ascending: false });

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.json({ routes: data });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * GET /v1/developer/analytics
 * Get developer analytics
 */
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data, error } = await supabase
      .from('xf_settlements')
      .select('*')
      .eq('developer_id', req.developer.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    const totalVolume = data.reduce((sum, s) => sum + Number(s.amount_usd || 0), 0);
    const totalFees = data.reduce((sum, s) => sum + Number(s.fee_usd || 0), 0);
    const totalCalls = data.length;

    res.json({
      analytics: {
        totalCalls,
        totalVolumeUSD: totalVolume.toFixed(2),
        totalFeesUSD: totalFees.toFixed(2),
        recentSettlements: data.slice(0, 20)
      }
    });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * PATCH /v1/developer/routes/:routeId
 * Update a route (toggle active status, update price, etc.)
 */
router.patch('/routes/:routeId', authenticate, async (req, res) => {
  try {
    const { routeId } = req.params;
    const { isActive, priceUsd, description, targetUrl } = req.body;
    const supabase = req.app.locals.supabase;

    // Verify route belongs to this developer
    const { data: route } = await supabase
      .from('xf_api_routes')
      .select('id')
      .eq('id', routeId)
      .eq('developer_id', req.developer.id)
      .single();

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Build update object with only provided fields
    const updates = {};
    if (typeof isActive === 'boolean') updates.is_active = isActive;
    if (typeof priceUsd === 'number' && priceUsd > 0) updates.price_usd = priceUsd;
    if (typeof description === 'string') updates.description = description;
    if (targetUrl) {
      const urlCheck = validateTargetUrl(targetUrl);
      if (!urlCheck.valid) {
        return res.status(400).json({ error: urlCheck.error });
      }
      updates.target_url = targetUrl;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('xf_api_routes')
      .update(updates)
      .eq('id', routeId)
      .select()
      .single();

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.json({ route: data });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * DELETE /v1/developer/routes/:routeId
 * Delete a route
 */
router.delete('/routes/:routeId', authenticate, async (req, res) => {
  try {
    const { routeId } = req.params;
    const supabase = req.app.locals.supabase;

    const { error } = await supabase
      .from('xf_api_routes')
      .delete()
      .eq('id', routeId)
      .eq('developer_id', req.developer.id);

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.json({ message: 'Route deleted' });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * POST /v1/developer/regenerate-key
 * Regenerate the developer's API key
 */
router.post('/regenerate-key', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const newApiKey = `xyl_${crypto.randomBytes(16).toString('hex')}`;
    const hashedKey = hashApiKey(newApiKey);

    const { error } = await supabase
      .from('xf_developers')
      .update({ api_key: hashedKey })
      .eq('id', req.developer.id);

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.json({
      apiKey: newApiKey,
      message: 'API key regenerated. Store it securely — it will not be shown again.'
    });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * GET /v1/developer/webhooks
 * List developer's webhook configurations
 */
router.get('/webhooks', authenticate, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data, error } = await supabase
      .from('xf_webhooks')
      .select('*')
      .eq('developer_id', req.developer.id)
      .order('created_at', { ascending: false });

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.json({ webhooks: data || [] });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * POST /v1/developer/webhooks
 * Create a webhook endpoint
 */
router.post('/webhooks', authenticate, async (req, res) => {
  try {
    const { url, events } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    const urlCheck = validateTargetUrl(url);
    if (!urlCheck.valid) {
      return res.status(400).json({ error: urlCheck.error });
    }

    const supabase = req.app.locals.supabase;
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const { data, error } = await supabase
      .from('xf_webhooks')
      .insert({
        developer_id: req.developer.id,
        url,
        events: events || ['payment.settled'],
        secret,
        is_active: true
      })
      .select()
      .single();

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.status(201).json({
      webhook: data,
      secret,
      message: 'Webhook created. Store the secret — it will not be shown again.'
    });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * DELETE /v1/developer/webhooks/:webhookId
 * Delete a webhook
 */
router.delete('/webhooks/:webhookId', authenticate, async (req, res) => {
  try {
    const { webhookId } = req.params;
    const supabase = req.app.locals.supabase;

    const { error } = await supabase
      .from('xf_webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('developer_id', req.developer.id);

    if (error) { console.error('[Developer Route Error]', error); return res.status(500).json({ error: 'Operation failed' }); }

    res.json({ message: 'Webhook deleted' });
  } catch (error) {
    console.error('[Developer Route Error]', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

module.exports = router;
