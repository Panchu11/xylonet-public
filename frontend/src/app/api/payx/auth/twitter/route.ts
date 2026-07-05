import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

/**
 * GET /api/payx/auth/twitter
 * Initiate Twitter OAuth 2.0 flow
 */
export async function GET(request: NextRequest) {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });
    
    const callbackUrl = process.env.TWITTER_CALLBACK_URL || 
      `${request.nextUrl.origin}/payx/api/auth/callback/twitter`;
    
    const { url, state, codeVerifier } = client.generateOAuth2AuthLink(
      callbackUrl,
      {
        scope: ['tweet.read', 'users.read'],
      }
    );
    
    // Store state and codeVerifier in session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    session.twitterState = state;
    session.twitterCodeVerifier = codeVerifier;
    await session.save();
    
    return NextResponse.json({ authUrl: url });
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter auth' },
      { status: 500 }
    );
  }
}
