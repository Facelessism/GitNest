import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.model.js";

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ githubId: profile.id });
          if (!user) {
            const email = profile.emails?.[0]?.value;
            user = await User.create({
              username: profile.username,
              email,
              githubId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn('GitHub OAuth not configured — GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing');
}

export default passport;