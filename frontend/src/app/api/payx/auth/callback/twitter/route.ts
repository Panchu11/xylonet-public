import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

/**
 * POST /api/payx/auth/callback/twitter
 * Handle Twitter OAuth callback
 */
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();
    
    // Get session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    // Verify state matches
    if (state !== session.twitterState) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }
    
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });
    
    const codeVerifier = session.twitterCodeVerifier!;
    const callbackUrl = process.env.TWITTER_CALLBACK_URL || 
      `${request.nextUrl.origin}/payx/api/auth/callback/twitter`;
    
    // Exchange code for tokens
    const { accessToken } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });
    
    // Get user info
    const userClient = new TwitterApi(accessToken);
    const { data: user } = await userClient.v2.me({
      'user.fields': ['profile_image_url', 'name', 'username'],
    });
    
    // Store user info in session
    session.twitterHandle = user.username;
    session.twitterId = user.id;
    session.twitterName = user.name;
    session.twitterProfileImage = user.profile_image_url;
    session.isLoggedIn = true;
    
    // Clear OAuth state
    delete session.twitterState;
    delete session.twitterCodeVerifier;
    
    await session.save();
    
    return NextResponse.json({
      success: true,
      user: {
        handle: user.username,
        name: user.name,
        profileImage: user.profile_image_url,
      },
    });
  } catch (error: any) {
    console.error('Twitter callback error:', error?.message || String(error));
    return NextResponse.json(
      { error: 'Failed to complete Twitter auth' },
      { status: 500 }
    );
  }
}
