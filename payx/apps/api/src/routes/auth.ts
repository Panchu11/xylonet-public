import { Router, Request, Response } from "express";
import { TwitterApi } from "twitter-api-v2";

const router = Router();

// Extend session type
declare module "express-session" {
  interface SessionData {
    twitterState?: string;
    twitterCodeVerifier?: string;
    twitterHandle?: string;
    twitterId?: string;
    twitterName?: string;
    twitterProfileImage?: string;
  }
}

// Twitter OAuth 2.0 Client
const getTwitterClient = () => {
  return new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });
};

/**
 * GET /api/auth/twitter
 * Initiate Twitter OAuth 2.0 flow
 */
router.get("/twitter", async (req: Request, res: Response) => {
  try {
    const client = getTwitterClient();
    
    const callbackUrl = process.env.TWITTER_CALLBACK_URL || 
      "http://localhost:3000/api/auth/callback/twitter";
    
    const { url, state, codeVerifier } = client.generateOAuth2AuthLink(
      callbackUrl,
      {
        scope: ["tweet.read", "users.read"],
      }
    );
    
    // Store in session for verification
    req.session.twitterState = state;
    req.session.twitterCodeVerifier = codeVerifier;
    
    res.json({ authUrl: url });
  } catch (error) {
    console.error("Twitter auth error:", error);
    res.status(500).json({ error: "Failed to initiate Twitter auth" });
  }
});

/**
 * POST /api/auth/twitter/callback
 * Handle Twitter OAuth callback
 */
router.post("/twitter/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;
    
    // Verify state matches
    if (state !== req.session.twitterState) {
      res.status(400).json({ error: "Invalid state parameter" });
      return;
    }
    
    const client = getTwitterClient();
    const codeVerifier = req.session.twitterCodeVerifier!;
    const callbackUrl = process.env.TWITTER_CALLBACK_URL || 
      "http://localhost:3000/api/auth/callback/twitter";
    
    // Exchange code for tokens
    const { accessToken } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });
    
    // Get user info
    const userClient = new TwitterApi(accessToken);
    const { data: user } = await userClient.v2.me({
      "user.fields": ["profile_image_url", "name", "username"],
    });
    
    // Store user info in session
    req.session.twitterHandle = user.username;
    req.session.twitterId = user.id;
    req.session.twitterName = user.name;
    req.session.twitterProfileImage = user.profile_image_url;
    
    // Clear OAuth state
    delete req.session.twitterState;
    delete req.session.twitterCodeVerifier;
    
    res.json({
      success: true,
      user: {
        handle: user.username,
        name: user.name,
        profileImage: user.profile_image_url,
      },
    });
  } catch (error: any) {
    console.error("Twitter callback error:", error?.message || String(error));
    res.status(500).json({ error: "Failed to complete Twitter auth" });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", (req: Request, res: Response) => {
  if (!req.session.twitterHandle) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  
  res.json({
    handle: req.session.twitterHandle,
    name: req.session.twitterName,
    profileImage: req.session.twitterProfileImage,
  });
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.json({ success: true });
  });
});

export const authRoutes = router;
