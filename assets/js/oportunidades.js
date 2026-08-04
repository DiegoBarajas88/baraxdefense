const listEl = document.getElementById("opList");
const countEl = document.getElementById("opCount");
const userEl = document.getElementById("currentUser");
const adminLink = document.getElementById("adminLink");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalReason = document.getElementById("modalReason");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");
const logoutBtn = document.getElementById("logoutBtn");

let pendingDiscardId = null;

function formatMoney(value) {
  if (value === null || value === undefined) return "No informado";
  return "$" + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function renderCard(op) {
  const tags = (op.evidence || [])
    .map((reason) => `<span class="opp-tag">${escapeHtml(reason)}</span>`)
    .join("");
  const link = op.secop_url
    ? `<a href="${escapeHtml(op.secop_url)}" target="_blank" rel="noopener">Abrir en SECOP II</a>`
    : "No informado";

  const card = document.createElement("article");
  card.className = "opp-card";
  card.dataset.id = op.id;
  card.innerHTML = `
    <div class="opp-entity">${escapeHtml(op.entity || "Entidad no informada")}</div>
    <div class="opp-reference">${escapeHtml(op.reference || "")}</div>
    <p class="opp-object">${escapeHtml(op.object || "")}</p>
    <div class="opp-tags">${tags}</div>
    <dl class="opp-meta">
      <div><dt>Valor</dt><dd>${formatMoney(op.value)}</dd></div>
      <div><dt>Ubicación</dt><dd>${escapeHtml(op.location || "No informada")}</dd></div>
      <div><dt>Estado / fase</dt><dd>${escapeHtml(op.procedure_state || "")} · ${escapeHtml(op.phase || "")}</dd></div>
      <div><dt>Fecha de ofertas</dt><dd>${escapeHtml(op.offer_deadline || "No informada")}</dd></div>
      <div><dt>Portal</dt><dd>${link}</dd></div>
    </dl>
    <div class="opp-actions">
      <button class="opp-btn opp-btn-interesa" data-action="interesa">Me interesa</button>
      <button class="opp-btn opp-btn-no" data-action="no_interesa">No me interesa</button>
    </div>
  `;
  return card;
}

async function decide(opportunityId, decision, reason) {
  const response = await fetch("/api/decide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ opportunity_id: opportunityId, decision, reason: reason || undefined }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo registrar la decisión.");
  }
}

function removeCard(id) {
  const card = listEl.querySelector(`[data-id="${id}"]`);
  if (card) card.remove();
  if (!listEl.children.length) {
    listEl.innerHTML = '<p class="app-empty">No hay oportunidades pendientes por revisar.</p>';
  }
  const remaining = listEl.querySelectorAll(".opp-card").length;
  countEl.textContent = `${remaining} oportunidad(es) pendiente(s)`;
}

function openModal(id) {
  pendingDiscardId = id;
  modalReason.value = "";
  modalBackdrop.hidden = false;
}

function closeModal() {
  pendingDiscardId = null;
  modalBackdrop.hidden = true;
}

listEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const card = button.closest(".opp-card");
  const id = card.dataset.id;

  if (button.dataset.action === "no_interesa") {
    openModal(id);
    return;
  }

  button.disabled = true;
  try {
    await decide(id, "interesa");
    removeCard(id);
  } catch (error) {
    alert(error.message);
    button.disabled = false;
  }
});

modalCancel.addEventListener("click", closeModal);

modalConfirm.addEventListener("click", async () => {
  if (!pendingDiscardId) return;
  const id = pendingDiscardId;
  modalConfirm.disabled = true;
  try {
    await decide(id, "no_interesa", modalReason.value.trim());
    closeModal();
    removeCard(id);
  } catch (error) {
    alert(error.message);
  } finally {
    modalConfirm.disabled = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
});

async function load() {
  try {
    const response = await fetch("/api/opportunities");
    if (response.status === 401) {
      window.location.href = "/login?next=/oportunidades";
      return;
    }
    if (!response.ok) throw new Error("No se pudieron cargar las oportunidades.");
    const { user, opportunities } = await response.json();
    userEl.textContent = user;
    adminLink.hidden = user !== "diego";
    listEl.innerHTML = "";
    if (!opportunities.length) {
      listEl.innerHTML = '<p class="app-empty">No hay oportunidades pendientes por revisar.</p>';
    } else {
      opportunities.forEach((op) => listEl.appendChild(renderCard(op)));
    }
    countEl.textContent = `${opportunities.length} oportunidad(es) pendiente(s)`;
  } catch (error) {
    countEl.textContent = error.message;
  }
}

load();
