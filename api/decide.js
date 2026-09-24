import nodemailer from "nodemailer";
import { getSession } from "../lib/session.js";
import { getSupabase } from "../lib/supabase.js";
import { getUsers } from "../lib/users.js";
import { getUserAccess } from "../lib/rules.js";
import { greeting, wrapEmail } from "../lib/email.js";

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

async function sendInterestEmail(userKey, user, opportunity) {
  const transport = getTransport();
  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;">${greeting(userKey)},</p>
    <p style="margin:0 0 22px;font-size:14px;color:#3B4A63;line-height:1.65;">
      Confirmamos que registraste tu interés en la siguiente oportunidad. Nuestro equipo
      dará seguimiento al proceso.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:#F7F9FB;border:1px solid #E1E7EF;border-radius:6px;">
      <tr><td style="padding:18px 20px 4px;font-size:15px;font-weight:700;color:#0A1628;">
        ${opportunity.entity || "Entidad no informada"}</td></tr>
      <tr><td style="padding:0 20px 14px;font-size:12px;color:#8A9BB5;letter-spacing:0.03em;">
        ${opportunity.reference || ""}</td></tr>
      <tr><td style="padding:0 20px 14px;font-size:13px;color:#3B4A63;line-height:1.5;">
        ${opportunity.object || ""}</td></tr>
      <tr><td style="padding:0 20px 18px;font-size:13px;color:#3B4A63;">
        <strong>Valor:</strong> ${formatMoney(opportunity.value)} &nbsp;·&nbsp;
        <strong>Fecha de ofertas:</strong> ${opportunity.offer_deadline || "No informada"}</td></tr>
    </table>`;
  await transport.sendMail({
    from: '"Emilio Bustamante — BARAX Defense & Technology" <contacto@baraxdefense.com>',
    to: user.email,
    subject: `Me interesa: ${opportunity.entity || "Proceso SECOP"} — ${opportunity.reference || ""}`,
    html: wrapEmail({
      preheader: `Registramos tu interés en ${opportunity.entity || "un proceso SECOP"}.`,
      bodyHtml,
      ctaLabel: "Abrir proceso en SECOP II",
      ctaUrl: opportunity.secop_url || "https://www.baraxdefense.com/oportunidades",
    }),
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
  const access = await getUserAccess(session.user);
  const canAccess = access.seesAll || access.categories.includes(opportunity?.category);
  if (fetchError || !opportunity || !canAccess) {
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
      await sendInterestEmail(session.user, user, opportunity);
    } catch (emailError) {
      res.status(207).json({ ok: true, emailError: emailError.message });
      return;
    }
  }

  res.status(200).json({ ok: true });
}
