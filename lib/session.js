import { SESSION_COOKIE, parseCookies, verifySession } from "./auth.js";

export async function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySession(cookies[SESSION_COOKIE], process.env.AUTH_SECRET);
}
