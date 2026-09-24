import { getSession } from "../../lib/session.js";
import { getAllUserRules, setUserCategories } from "../../lib/rules.js";
import { CATEGORY_IDS } from "../../lib/categories.js";

// Quién puede administrar las reglas de destinatarios. Por ahora solo Diego;
// se amplía esta lista si más adelante alguien más debe poder editarlas.
const ADMIN_USERS = ["diego"];

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session || !ADMIN_USERS.includes(session.user)) {
    res.status(403).json({ error: "No autorizado" });
    return;
  }

  if (req.method === "GET") {
    try {
      const rules = await getAllUserRules();
      res.status(200).json({ rules });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }

  if (req.method === "PATCH") {
    const { user_key: userKey, categories } = req.body || {};
    if (
      typeof userKey !== "string" ||
      !Array.isArray(categories) ||
      categories.length === 0 ||
      categories.some((category) => !CATEGORY_IDS.includes(category))
    ) {
      res.status(400).json({ error: "Solicitud inválida" });
      return;
    }
    try {
      await setUserCategories(userKey, categories);
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
