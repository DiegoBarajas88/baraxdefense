// Qué categorías ve/recibe cada usuario. Vive en Supabase (tabla user_rules)
// en vez de hardcodeada en el código, para que se pueda editar desde /admin
// sin redeploy. screener-secop/src/notify_new_opportunities.py lee la misma
// tabla para decidir a quién avisar.

import { getSupabase } from "./supabase.js";

export async function getUserCategories(userKey) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_rules")
    .select("categories")
    .eq("user_key", userKey)
    .single();
  if (error || !data) return [];
  return data.categories || [];
}

// sees_all: usuarios "dueño" (hoy solo Diego) que ven el portafolio completo
// en el dashboard, no solo sus categorías — la notificación diaria por correo
// sigue usando `categories` sin cambios, para no duplicar avisos.
export async function getUserAccess(userKey) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_rules")
    .select("name, email, categories, sees_all")
    .eq("user_key", userKey)
    .single();
  if (error || !data) return { name: userKey, email: null, categories: [], seesAll: false };
  return { name: data.name, email: data.email, categories: data.categories || [], seesAll: !!data.sees_all };
}

export async function getAllUserRules() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_rules")
    .select("user_key, name, email, categories, updated_at")
    .order("user_key");
  if (error) throw new Error(error.message);
  return data;
}

export async function setUserCategories(userKey, categories) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("user_rules")
    .update({ categories, updated_at: new Date().toISOString() })
    .eq("user_key", userKey);
  if (error) throw new Error(error.message);
}
