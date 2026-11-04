import { getSupabase } from "../lib/supabase.js";

// Keep-alive de Supabase: el proyecto BaraxDefense es del plan Free y Supabase
// lo pausa tras 7 días sin actividad. El cron de vercel.json llama este
// endpoint una vez al día y hace una consulta real (1 fila de opportunities).
// Si CRON_SECRET está definido en Vercel, solo responde a Vercel Cron, que
// envía "Authorization: Bearer <CRON_SECRET>". No devuelve datos.
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ ok: false });
    return;
  }

  const { error } = await getSupabase().from("opportunities").select("id").limit(1);
  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }
  res.status(200).json({ ok: true, at: new Date().toISOString() });
}
