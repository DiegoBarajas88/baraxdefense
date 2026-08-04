const listEl = document.getElementById("rulesList");
const errorEl = document.getElementById("rulesError");
const userEl = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

const CATEGORIES = [
  { id: "repuestos_llantas", label: "Repuestos y llantas" },
  { id: "linea_naval", label: "Línea naval y equipos" },
  { id: "aviatek", label: "Aviatek (RUP)" },
];

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function renderRule(rule) {
  const checkboxes = CATEGORIES.map(
    (category) => `
      <label class="rule-checkbox">
        <input type="checkbox" value="${category.id}" ${rule.categories.includes(category.id) ? "checked" : ""}>
        ${escapeHtml(category.label)}
      </label>
    `,
  ).join("");

  const card = document.createElement("article");
  card.className = "opp-card rule-card";
  card.dataset.userKey = rule.user_key;
  card.innerHTML = `
    <div class="opp-entity">${escapeHtml(rule.user_key)}</div>
    <div class="opp-reference">${escapeHtml(rule.email)}</div>
    <div class="rule-checkboxes">${checkboxes}</div>
    <div class="opp-actions">
      <button class="opp-btn opp-btn-interesa" data-action="save">Guardar</button>
      <span class="rule-status" data-role="status"></span>
    </div>
  `;
  return card;
}

async function save(userKey, card) {
  const categories = Array.from(card.querySelectorAll("input[type=checkbox]:checked")).map((input) => input.value);
  const status = card.querySelector('[data-role="status"]');
  if (categories.length === 0) {
    status.textContent = "Selecciona al menos una categoría.";
    return;
  }
  const button = card.querySelector('button[data-action="save"]');
  button.disabled = true;
  status.textContent = "Guardando…";
  try {
    const response = await fetch("/api/admin/rules", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_key: userKey, categories }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "No se pudo guardar.");
    }
    status.textContent = "Guardado.";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

listEl.addEventListener("click", (event) => {
  const button = event.target.closest('button[data-action="save"]');
  if (!button) return;
  const card = button.closest(".rule-card");
  save(card.dataset.userKey, card);
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
});

async function load() {
  try {
    const response = await fetch("/api/admin/rules");
    if (response.status === 401) {
      window.location.href = "/login?next=/admin";
      return;
    }
    if (response.status === 403) {
      listEl.innerHTML = "";
      errorEl.textContent = "Tu usuario no tiene permiso para administrar estas reglas.";
      return;
    }
    if (!response.ok) throw new Error("No se pudieron cargar las reglas.");
    const { rules } = await response.json();
    userEl.textContent = "diego";
    listEl.innerHTML = "";
    rules.forEach((rule) => listEl.appendChild(renderRule(rule)));
  } catch (error) {
    errorEl.textContent = error.message;
  }
}

load();
