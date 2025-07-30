import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((req.session as any).employee) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  // Show database connection info in the terminal
  console.log("[DB Connection]", {
    url: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
  });
  // Add your own authentication logic here if needed.
}
