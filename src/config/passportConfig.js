import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {user} from "../models/userModel.js";
//here we are adding google start to our passport config
//so password use it to authenticate users with google
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let userData = await user.findByEmail(profile.emails[0].value);
          if (!userData) {
            // Create a new user
            userData = await user.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              role: "customer", // Default role for Google users
            });
          }
          return done(null, userData);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
//manage session data for (ADMIN,AGENT )
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
passport.deserializeUser(async (id, done) => {
try {
  // Fetch the full user object using the ID
  const User = await user.findById(id);
  if (!User) {
    return done(new Error("User not found"), null); // Handle case where user is not found
  }
  done(null, user); // Attach the full user object to req.user
} catch (err) {
  done(err, null); // Pass the error to Passport
}
});