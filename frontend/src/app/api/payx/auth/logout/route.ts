import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData, defaultSession } from '@/lib/session';

/**
 * POST /api/payx/auth/logout
 * Logout current user
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    // Clear session
    session.twitterHandle = undefined;
    session.twitterId = undefined;
    session.twitterName = undefined;
    session.twitterProfileImage = undefined;
    session.isLoggedIn = false;
    
    await session.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
