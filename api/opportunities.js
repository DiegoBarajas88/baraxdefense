import { getSession } from "../lib/session.js";
import { getSupabase } from "../lib/supabase.js";
import { getUsers } from "../lib/users.js";
import { getUserCategories } from "../lib/rules.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const session = await getSession(req);
  const users = getUsers();
  const user = session && users[session.user];
  if (!user) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const categories = await getUserCategories(session.user);
  if (categories.length === 0) {
    res.status(200).json({ user: session.user, opportunities: [] });
    return;
  }

  const supabase = getSupabase();
  const { data: decided, error: decidedError } = await supabase
    .from("decisions")
    .select("opportunity_id")
    .eq("user_id", session.user);
  if (decidedError) {
    res.status(500).json({ error: decidedError.message });
    return;
  }

  const decidedIds = decided.map((row) => row.opportunity_id);
  let query = supabase
    .from("opportunities")
    .select("*")
    .in("category", categories)
    .order("score", { ascending: false });
  if (decidedIds.length > 0) {
    query = query.not("id", "in", `(${decidedIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json({ user: session.user, opportunities: data });
}
