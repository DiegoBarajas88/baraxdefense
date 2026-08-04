import { SESSION_COOKIE, parseCookies, verifySession } from "./lib/auth.js";

export const config = {
  matcher: [
    "/oportunidades",
    "/oportunidades/:path*",
    "/admin",
    "/admin/:path*",
    "/api/opportunities",
    "/api/decide",
    "/api/forward",
    "/api/logout",
    "/api/admin/:path*",
  ],
};

export default async function middleware(request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const session = await verifySession(cookies[SESSION_COOKIE], process.env.AUTH_SECRET);
  if (session) return; // continúa hacia el origen sin modificar la respuesta

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", url.pathname);
  return Response.redirect(loginUrl, 302);
}
