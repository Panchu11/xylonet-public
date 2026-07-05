import { SessionOptions } from 'iron-session';

export interface SessionData {
  twitterState?: string;
  twitterCodeVerifier?: string;
  twitterHandle?: string;
  twitterId?: string;
  twitterName?: string;
  twitterProfileImage?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_please_change_this_in_production',
  cookieName: 'payx_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
