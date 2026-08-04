import { getSession } from "../lib/session.js";
import { getSupabase } from "../lib/supabase.js";
import { getUsers } from "../lib/users.js";
import { getUserAccess } from "../lib/rules.js";

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

  const access = await getUserAccess(session.user);
  if (!access.seesAll && access.categories.length === 0) {
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
  let query = supabase.from("opportunities").select("*").order("score", { ascending: false });
  if (!access.seesAll) {
    query = query.in("category", access.categories);
  }
  if (decidedIds.length > 0) {
    query = query.not("id", "in", `(${decidedIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Un usuario con visión completa (Diego) también ve qué decidieron los
  // demás sobre las oportunidades que no le pertenecen (p.ej. las que Tito
  // ya descartó), sin que eso las oculte de su propia lista.
  let peerDecisionsByOpportunity = {};
  if (access.seesAll && data.length > 0) {
    const { data: peerDecisions } = await supabase
      .from("decisions")
      .select("opportunity_id, user_id, decision")
      .neq("user_id", session.user)
      .in(
        "opportunity_id",
        data.map((row) => row.id),
      );
    peerDecisionsByOpportunity = (peerDecisions || []).reduce((acc, row) => {
      (acc[row.opportunity_id] ||= []).push({ user: row.user_id, decision: row.decision });
      return acc;
    }, {});
  }

  const opportunities = data.map((row) => ({
    ...row,
    peer_decisions: peerDecisionsByOpportunity[row.id] || [],
  }));

  res.status(200).json({ user: session.user, opportunities });
}
