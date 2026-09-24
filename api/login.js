import { SESSION_COOKIE, signSession } from "../lib/auth.js";
import { getUsers } from "../lib/users.js";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 días

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { username, password } = req.body || {};
  const users = getUsers();
  const entry = Object.entries(users).find(
    ([, user]) => user.username && user.username === username && user.password === password,
  );
  if (!entry) {
    res.status(401).json({ error: "Usuario o clave incorrectos" });
    return;
  }

  const [userId] = entry;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await signSession({ user: userId, exp }, process.env.AUTH_SECRET);
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
  );
  res.status(200).json({ user: userId });
}
