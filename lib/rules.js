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

export async function getAllUserRules() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_rules")
    .select("user_key, email, categories, updated_at")
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
