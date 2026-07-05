// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Twitter API v2 Client
// ═══════════════════════════════════════════════════════════════════════════

import { TwitterApi } from 'twitter-api-v2';
import type { TwitterPostResult, TwitterRateLimit } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TWITTER_CONFIG = {
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TWITTER CLIENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class TwitterBotClient {
  private client: TwitterApi;
  private lastRateLimit: TwitterRateLimit | null = null;

  constructor() {
    // Initialize Twitter API v2 client with OAuth 1.0a User Context
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: TWITTER_CONFIG.accessToken,
      accessSecret: TWITTER_CONFIG.accessSecret,
    });
  }

  /**
   * Post a tweet to Twitter
   * @param text Tweet content (max 4000 characters for Twitter Premium)
   * @param dryRun If true, validates but doesn't post
   * @returns Result with tweet_id or error
   */
  async postTweet(text: string, dryRun: boolean = false): Promise<TwitterPostResult> {
    try {
      // Validate tweet length (Twitter Premium allows up to 4000 characters)
      const MAX_PREMIUM_LENGTH = 4000;
      if (text.length > MAX_PREMIUM_LENGTH) {
        return {
          success: false,
          error: `Tweet too long: ${text.length} characters (max ${MAX_PREMIUM_LENGTH})`,
        };
      }

      if (text.length === 0) {
        return {
          success: false,
          error: 'Tweet text cannot be empty',
        };
      }

      // Dry run mode: validate only
      if (dryRun) {
        console.log('[TwitterBot] DRY RUN - Would post:', text);
        return {
          success: true,
          tweet_id: 'dry_run_' + Date.now(),
        };
      }

      // Post tweet via Twitter API v2
      const response = await this.client.v2.tweet(text);

      // Extract rate limit info from response headers (if available)
      this.lastRateLimit = this.extractRateLimit(response);

      return {
        success: true,
        tweet_id: response.data.id,
        rate_limit: this.lastRateLimit || undefined,
      };
    } catch (error: any) {
      console.error('[TwitterBot] Post error:', error);
      
      // Extract detailed error info from Twitter API response
      const errorData = error.data || {};
      const errorDetail = errorData.detail || errorData.title || '';
      const errorErrors = errorData.errors || [];
      const firstError = errorErrors[0] || {};
      
      // Log full error for debugging
      console.error('[TwitterBot] Error details:', JSON.stringify({
        code: error.code,
        detail: errorDetail,
        errors: errorErrors,
        rateLimit: error.rateLimit,
      }, null, 2));

      // Handle specific Twitter API errors
      if (error.code === 429) {
        // Rate limit exceeded
        const resetTime = error.rateLimit?.reset || Date.now() + 15 * 60 * 1000;
        return {
          success: false,
          error: `Rate limit exceeded. Resets at ${new Date(resetTime * 1000).toISOString()}`,
          rate_limit: {
            limit: error.rateLimit?.limit || 0,
            remaining: 0,
            reset: resetTime,
          },
        };
      }

      if (error.code === 403) {
        // Parse specific 403 reasons
        let reason = 'Unknown 403 error';
        
        // Check for duplicate tweet
        if (errorDetail.includes('duplicate') || firstError.message?.includes('duplicate')) {
          reason = 'Duplicate tweet - this exact text was already posted';
        }
        // Check for daily tweet limit (X Free tier = 17 tweets/day)
        else if (errorDetail.includes('limit') || errorDetail.includes('cap') || firstError.code === 185) {
          reason = 'Daily tweet limit reached (X Free tier: 17 tweets/day)';
        }
        // Check for write permission
        else if (errorDetail.includes('write') || errorDetail.includes('permission')) {
          reason = 'App lacks write permission - check Twitter Developer Portal';
        }
        // Check for content policy
        else if (errorDetail.includes('policy') || errorDetail.includes('violation')) {
          reason = 'Tweet violates Twitter content policy';
        }
        // Check for suspended app
        else if (errorDetail.includes('suspend')) {
          reason = 'Twitter app or account may be suspended';
        }
        // Fallback to raw error
        else if (errorDetail) {
          reason = errorDetail;
        } else if (firstError.message) {
          reason = firstError.message;
        }
        
        return {
          success: false,
          error: `403 Forbidden: ${reason}`,
        };
      }

      if (error.code === 401) {
        return {
          success: false,
          error: 'Twitter API authentication failed. Invalid credentials.',
        };
      }

      if (error.code === 400) {
        // Parse specific 400 reasons
        let reason = 'Invalid request parameters';
        
        // Check for specific issues
        if (errorDetail.includes('mention') || errorDetail.includes('entities')) {
          reason = 'Too many mentions/entities in tweet - Twitter limits ~50 mentions per tweet';
        } else if (errorDetail.includes('character') || errorDetail.includes('length')) {
          reason = 'Tweet content invalid or too long';
        } else if (errorDetail) {
          reason = errorDetail;
        } else if (firstError.message) {
          reason = firstError.message;
        }
        
        return {
          success: false,
          error: `400 Bad Request: ${reason}`,
        };
      }

      // Generic error
      return {
        success: false,
        error: error.message || 'Unknown Twitter API error',
      };
    }
  }

  /**
   * Get current rate limit status
   * @returns Rate limit info or null if unknown
   */
  getRateLimit(): TwitterRateLimit | null {
    return this.lastRateLimit;
  }

  /**
   * Check if rate limit is close to being hit
   * @param threshold Percentage threshold (default: 90%)
   * @returns True if at or above threshold
   */
  isRateLimitCritical(threshold: number = 0.9): boolean {
    if (!this.lastRateLimit) return false;
    
    const usage = (this.lastRateLimit.limit - this.lastRateLimit.remaining) / this.lastRateLimit.limit;
    return usage >= threshold;
  }

  /**
   * Extract rate limit info from API response
   * @private
   */
  private extractRateLimit(response: any): TwitterRateLimit | null {
    try {
      // Twitter API v2 includes rate limit in response headers
      const rateLimit = response.rateLimit;
      if (rateLimit) {
        return {
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Test API connection
   * @returns True if credentials are valid
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.v2.me();
      return true;
    } catch (error) {
      console.error('[TwitterBot] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get authenticated user info
   * @returns User data or null if failed
   */
  async getMe(): Promise<{ id: string; username: string; name: string } | null> {
    try {
      const response = await this.client.v2.me();
      return {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
      };
    } catch (error) {
      console.error('[TwitterBot] Failed to get user info:', error);
      return null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

let twitterClientInstance: TwitterBotClient | null = null;

/**
 * Get singleton Twitter client instance
 * @returns Twitter client instance
 */
export function getTwitterClient(): TwitterBotClient {
  if (!twitterClientInstance) {
    twitterClientInstance = new TwitterBotClient();
  }
  return twitterClientInstance;
}

/**
 * Validate Twitter credentials are configured
 * @throws Error if credentials are missing
 */
export function validateTwitterCredentials(): void {
  const required = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing Twitter credentials: ${missing.join(', ')}`);
  }
}
