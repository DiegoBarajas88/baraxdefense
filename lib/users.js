// Credenciales de acceso a /oportunidades. Qué categorías ve cada usuario ya
// no vive aquí: se lee de Supabase (tabla user_rules, ver lib/rules.js) para
// poder editarla desde /admin sin redeploy.

export function getUsers() {
  return {
    tito: {
      username: process.env.AUTH_TITO_USER,
      password: process.env.AUTH_TITO_PASS,
      email: process.env.AUTH_TITO_EMAIL,
    },
    diego: {
      username: process.env.AUTH_DIEGO_USER,
      password: process.env.AUTH_DIEGO_PASS,
      email: process.env.AUTH_DIEGO_EMAIL,
    },
  };
}
