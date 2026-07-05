import { NextResponse } from 'next/server';

/**
 * GET /api/payx/health
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PayX API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    network: 'Arc Testnet',
  });
}
