import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import userQuery from "../db/userQuery.ts";

declare module "express-session" {
  interface SessionData {
    messages?: string[];
  }
}

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await userQuery.getUserByEmail(email.toLowerCase());
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        const isPasswordMatched = await bcrypt.compare(
          password,
          user.hashedPassword,
        );
        if (!isPasswordMatched) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await userQuery.getUserById(id);
    done(null, user ?? false);
  } catch (err) {
    done(err);
  }
});
