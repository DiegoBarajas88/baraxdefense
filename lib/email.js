// Envoltorio HTML compartido por los correos del sistema (decide.js hoy;
// cualquier correo futuro debería usarlo para mantener una sola firma).
// Basado en tablas con estilos inline a propósito: es lo único que Outlook y
// Gmail renderizan de forma consistente, a diferencia de flexbox/grid.

const LOGO_URL = "https://www.baraxdefense.com/assets/logos/barax-logo-email.png";
const DASHBOARD_URL = "https://www.baraxdefense.com/oportunidades";

export const USER_NAMES = {
  tito: "Tito Barajas",
  diego: "Diego Barajas",
};

export function greeting(userKey) {
  const name = USER_NAMES[userKey] || userKey;
  return `Estimado Sr. ${name}`;
}

export function wrapEmail({ preheader = "", bodyHtml, ctaLabel, ctaUrl = DASHBOARD_URL }) {
  const cta = ctaLabel
    ? `
      <tr>
        <td style="padding:4px 32px 32px;text-align:center;">
          <a href="${ctaUrl}" style="background:#00D4FF;color:#0A1628;font-weight:700;text-decoration:none;
            padding:13px 30px;border-radius:4px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;
            display:inline-block;font-family:Arial,Helvetica,sans-serif;">${ctaLabel}</a>
        </td>
      </tr>`
    : "";

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#F0F4F8;">
  <span style="display:none;font-size:0;color:#F0F4F8;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="background:#FFFFFF;border:1px solid #E1E7EF;border-radius:8px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background:#0A1628;padding:22px 32px;">
              <img src="${LOGO_URL}" width="170" alt="BARAX Defense &amp; Technology" style="display:block;border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;font-family:Arial,Helvetica,sans-serif;color:#0A1628;">
              ${bodyHtml}
            </td>
          </tr>
          ${cta}
          <tr>
            <td style="padding:0 32px 28px;font-family:Arial,Helvetica,sans-serif;">
              <hr style="border:none;border-top:1px solid #E1E7EF;margin:0 0 20px;">
              <p style="margin:0;font-size:14px;color:#0A1628;font-weight:700;">Emilio Bustamante</p>
              <p style="margin:2px 0 10px;font-size:11px;color:#0098B8;letter-spacing:0.06em;text-transform:uppercase;">
                Director de Licitaciones</p>
              <p style="margin:0;font-size:12px;color:#8A9BB5;line-height:1.6;">
                BARAX Defense &amp; Technology<br>
                contacto@baraxdefense.com · www.baraxdefense.com</p>
            </td>
          </tr>
          <tr>
            <td style="background:#F7F9FB;padding:14px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#8A9BB5;font-family:Arial,Helvetica,sans-serif;">
                Radar SECOP — aviso automático del sistema de detección de oportunidades.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
