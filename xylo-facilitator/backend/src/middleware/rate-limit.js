/**
 * Per-developer and per-IP rate limiting middleware
 * Uses in-memory sliding window counters
 */

// Store: { [key]: { count, windowStart } }
const windows = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, { windowStart }] of windows) {
    if (now - windowStart > WINDOW_MS * 2) windows.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Rate limit middleware for the x402 proxy
 * Requires route lookup to have already identified the developer
 */
function createRateLimiter() {
  return (req, res, next) => {
    // Rate limiting is applied after route lookup in x402-proxy
    // This is a standalone middleware for explicit API key routes
    const developerId = req.developer?.id;
    if (!developerId) return next();

    const limit = req.developer.rate_limit_rpm || 60;
    const now = Date.now();
    const key = `dev_${developerId}`;

    let window = windows.get(key);
    if (!window || now - window.windowStart > WINDOW_MS) {
      window = { count: 0, windowStart: now };
      windows.set(key, window);
    }

    window.count++;

    if (window.count > limit) {
      const retryAfter = Math.ceil((window.windowStart + WINDOW_MS - now) / 1000);
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(Math.ceil((window.windowStart + WINDOW_MS) / 1000)));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit,
        retryAfterSeconds: retryAfter
      });
    }

    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - window.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil((window.windowStart + WINDOW_MS) / 1000)));

    next();
  };
}

/**
 * Check rate limit for a developer by ID (used by x402-proxy)
 * Returns { allowed: boolean, remaining: number, limit: number, retryAfter?: number }
 */
function checkRateLimit(developerId, limit = 60) {
  const now = Date.now();
  const key = `dev_${developerId}`;

  let window = windows.get(key);
  if (!window || now - window.windowStart > WINDOW_MS) {
    window = { count: 0, windowStart: now };
    windows.set(key, window);
  }

  window.count++;

  if (window.count > limit) {
    const retryAfter = Math.ceil((window.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, limit, retryAfter };
  }

  return { allowed: true, remaining: Math.max(0, limit - window.count), limit };
}

/**
 * IP-based global rate limiter middleware
 * Enforces a hard cap on requests per IP address regardless of developer identity.
 * Default: 100 requests/minute per IP.
 *
 * On every request sets standard rate limit headers:
 *   X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 *
 * On 429 also sets Retry-After and returns JSON error body.
 *
 * @param {object} [options]
 * @param {number} [options.windowMs]  - Sliding window size in ms (default 60 000)
 * @param {number} [options.max]       - Max requests per window (default 100)
 * @returns {Function} Express middleware
 */
function createIpRateLimiter({ windowMs = WINDOW_MS, max = 100 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `ip_${ip}`;

    let window = windows.get(key);
    if (!window || now - window.windowStart > windowMs) {
      window = { count: 0, windowStart: now };
      windows.set(key, window);
    }

    window.count++;

    const resetEpoch = Math.ceil((window.windowStart + windowMs) / 1000);

    // Always set informational headers
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Reset', String(resetEpoch));

    if (window.count > max) {
      const retryAfter = Math.ceil((window.windowStart + windowMs - now) / 1000);
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Too many requests from this IP',
        retryAfterSeconds: retryAfter
      });
    }

    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - window.count)));
    next();
  };
}

module.exports = { createRateLimiter, checkRateLimit, createIpRateLimiter };
