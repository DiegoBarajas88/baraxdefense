import nodemailer from "nodemailer";
import { getSession } from "../lib/session.js";
import { getSupabase } from "../lib/supabase.js";
import { getUserAccess } from "../lib/rules.js";
import { greeting, wrapEmail } from "../lib/email.js";

// Con solo dos usuarios, "reenviar" siempre apunta al otro. Si más adelante
// hay más de dos, esto deja de alcanzar y hay que pedir el destino explícito.
const OTHER_USER = { tito: "diego", diego: "tito" };

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const session = await getSession(req);
  const targetKey = session && OTHER_USER[session.user];
  if (!targetKey) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const { opportunity_id: opportunityId } = req.body || {};
  if (!opportunityId) {
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

  const target = await getUserAccess(targetKey);
  if (!target.email) {
    res.status(500).json({ error: "No se encontró el correo del destinatario" });
    return;
  }

  const senderName = access.name || session.user;
  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;">${greeting(targetKey)},</p>
    <p style="margin:0 0 22px;font-size:14px;color:#3B4A63;line-height:1.65;">
      <strong>${senderName}</strong> encontró interesante la siguiente oportunidad y quiere
      que la revises.</p>
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

  try {
    const transport = getTransport();
    await transport.sendMail({
      from: '"Emilio De La Espriella — BARAX Defense & Technology" <contacto@baraxdefense.com>',
      to: target.email,
      subject: `${senderName} te comparte una oportunidad — ${opportunity.entity || "Proceso SECOP"}`,
      html: wrapEmail({
        preheader: `${senderName} encontró interesante ${opportunity.entity || "un proceso SECOP"}.`,
        bodyHtml,
        ctaLabel: "Ver en el dashboard",
      }),
    });
  } catch (emailError) {
    res.status(500).json({ error: emailError.message });
    return;
  }

  res.status(200).json({ ok: true });
}
