import nodemailer from "nodemailer";
import { getSession } from "../lib/session.js";
import { getSupabase } from "../lib/supabase.js";
import { getUsers } from "../lib/users.js";
import { getUserCategories } from "../lib/rules.js";

function getTransport() {
  const port = Number(process.env.SECOP_SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SECOP_SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SECOP_SMTP_USERNAME,
      pass: process.env.SECOP_SMTP_PASSWORD,
    },
  });
}

function formatMoney(value) {
  if (value === null || value === undefined) return "No informado";
  return "$" + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

async function sendInterestEmail(user, opportunity) {
  const transport = getTransport();
  await transport.sendMail({
    from: "contacto@baraxdefense.com",
    to: user.email,
    subject: `Me interesa: ${opportunity.entity || "Proceso SECOP"} — ${opportunity.reference || ""}`,
    html: `
      <p><strong>${opportunity.entity || ""}</strong></p>
      <p>${opportunity.object || ""}</p>
      <p>Valor: ${formatMoney(opportunity.value)}</p>
      <p>Fecha de presentación de ofertas: ${opportunity.offer_deadline || "No informada"}</p>
      <p><a href="${opportunity.secop_url || "#"}">Abrir proceso en SECOP II</a></p>
    `,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

  const { opportunity_id: opportunityId, decision, reason } = req.body || {};
  if (!opportunityId || !["interesa", "no_interesa"].includes(decision)) {
    res.status(400).json({ error: "Solicitud inválida" });
    return;
  }

  const supabase = getSupabase();
  const { data: opportunity, error: fetchError } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .single();
  const categories = await getUserCategories(session.user);
  if (fetchError || !opportunity || !categories.includes(opportunity.category)) {
    res.status(404).json({ error: "Oportunidad no encontrada" });
    return;
  }

  const emailSentAt = decision === "interesa" ? new Date().toISOString() : null;
  const { error: upsertError } = await supabase.from("decisions").upsert(
    {
      opportunity_id: opportunityId,
      user_id: session.user,
      decision,
      reason: reason || null,
      email_sent_at: emailSentAt,
    },
    { onConflict: "opportunity_id,user_id" },
  );
  if (upsertError) {
    res.status(500).json({ error: upsertError.message });
    return;
  }

  if (decision === "interesa") {
    try {
      await sendInterestEmail(user, opportunity);
    } catch (emailError) {
      res.status(207).json({ ok: true, emailError: emailError.message });
      return;
    }
  }

  res.status(200).json({ ok: true });
}
