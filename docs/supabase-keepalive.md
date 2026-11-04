# Supabase: que no pausen BaraxDefense

- Proyecto: **BaraxDefense**, `ref kxkyjdcmlbznifcijidq`, plan **Free**.
- Supabase pausa un proyecto Free tras **7 días sin actividad** y deja restaurarlo solo durante **90 días**.
  El 2026-11-03 llegó el aviso a contacto@diegobarajas.com.
- El sitio solo consulta la base cuando alguien entra a `/oportunidades` con usuario; si nadie entra en 7 días, se pausa.

## Keep-alive
- `api/keepalive.js` hace una consulta real (`select id from opportunities limit 1`) y no devuelve datos.
- `vercel.json` → `crons` lo llama **una vez al día** a las 09:17 UTC (04:17 Bogotá). El plan Hobby de Vercel
  permite crons diarios.
- Protección: crear en Vercel (Project Settings → Environment Variables, Production) la variable `CRON_SECRET`
  con un texto aleatorio largo. Vercel Cron la envía sola en el encabezado `Authorization`; sin ella el endpoint
  responde 401. Si la variable no existe, el endpoint queda abierto (solo responde `ok`, no expone datos).
- Verificar: Vercel → proyecto → Settings → Cron Jobs → **Run** y revisar que el log diga 200.

## Si ya lo pausaron
Entrar a https://supabase.com/dashboard/project/kxkyjdcmlbznifcijidq y pulsar **Restore project**.

## Alternativa definitiva
Plan Pro (USD 25/mes por organización) en Organization → Billing: sin pausas y con copias diarias.
