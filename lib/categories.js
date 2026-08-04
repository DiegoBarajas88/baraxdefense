// Categorías con las que push_opportunities.py etiqueta cada oportunidad
// (screener-secop/src/preview_alert.py::categorize_opportunity). Único lugar
// donde se listan para no repetirlas entre el API y la vista de /admin.

export const CATEGORIES = [
  { id: "repuestos_llantas", label: "Repuestos y llantas" },
  { id: "linea_naval", label: "Línea naval y equipos" },
  { id: "aviatek", label: "Aviatek (RUP)" },
];

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id);
