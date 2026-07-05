// ═══════════════════════════════════════════════════════════════════════════
// PayX Bot - Diagnostic Test Endpoint
// Tests Twitter API connection and identifies issues
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getTwitterClient, validateTwitterCredentials } from '@/lib/twitter-bot/client';

/**
 * GET /api/payx/bot/test
 * Test Twitter API connection and credentials
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    credentials: { configured: false, valid: false },
    connection: { success: false },
    user: null,
    errors: [],
  };

  try {
    // 1. Check if credentials are configured
    try {
      validateTwitterCredentials();
      results.credentials.configured = true;
    } catch (error: any) {
      results.credentials.configured = false;
      results.errors.push(`Credentials: ${error.message}`);
      return NextResponse.json(results);
    }

    // 2. Test connection
    const client = getTwitterClient();
    const connectionOk = await client.testConnection();
    results.connection.success = connectionOk;

    if (!connectionOk) {
      results.errors.push('Connection test failed - credentials may be invalid or revoked');
      return NextResponse.json(results);
    }

    results.credentials.valid = true;

    // 3. Get authenticated user info
    const user = await client.getMe();
    if (user) {
      results.user = {
        id: user.id,
        username: `@${user.username}`,
        name: user.name,
      };
    }

    // 4. Check rate limits (if available)
    const rateLimit = client.getRateLimit();
    if (rateLimit) {
      results.rateLimit = {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        resetAt: new Date(rateLimit.reset * 1000).toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    results.errors.push(`Unexpected error: ${error.message}`);
    return NextResponse.json({
      success: false,
      ...results,
    });
  }
}

/**
 * POST /api/payx/bot/test
 * Post a test tweet (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const adminKey = request.headers.get('x-admin-key');
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (!isLocalhost && expectedAdminKey && adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // Default to dry run for safety

    // Generate test tweet with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const testTweet = body.text || `🧪 PayX Bot Test

Timestamp: ${timestamp}

This is an automated test tweet.`;

    const client = getTwitterClient();
    const result = await client.postTweet(testTweet, dryRun);

    return NextResponse.json({
      success: result.success,
      dry_run: dryRun,
      tweet_text: testTweet,
      tweet_id: result.tweet_id,
      error: result.error,
      rate_limit: result.rate_limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
