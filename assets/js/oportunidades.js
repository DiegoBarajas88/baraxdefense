const listEl = document.getElementById("opList");
const countEl = document.getElementById("opCount");
const userEl = document.getElementById("currentUser");
const adminLink = document.getElementById("adminLink");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalReason = document.getElementById("modalReason");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");
const logoutBtn = document.getElementById("logoutBtn");

const PEER_LABEL = { tito: "Tito", diego: "Diego" };
const FORWARD_TARGET_LABEL = { tito: "Diego Felipe", diego: "Tito" };
const PRIORITY_LABEL = {
  1: "Prioridad 1 · Repuestos/filtros o entidad conocida",
  2: "Prioridad 2 · Llantas",
  3: "Prioridad 3 · Planta eléctrica",
  4: "Prioridad 4 · General",
};
const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

let currentUser = null;
let opportunities = [];
let pendingDiscardId = null;

function formatMoney(value) {
  if (value === null || value === undefined) return "No informado";
  return "$" + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function formatDateEs(isoDate) {
  if (!isoDate) return "No informada";
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}

function isToday(isoTimestamp) {
  if (!isoTimestamp) return false;
  const created = new Date(isoTimestamp);
  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate()
  );
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function peerDecisionBadge(peerDecision) {
  const who = PEER_LABEL[peerDecision.user] || peerDecision.user;
  if (peerDecision.decision === "no_interesa") {
    return `<span class="peer-badge peer-badge-no">Descartado por ${escapeHtml(who)}</span>`;
  }
  return `<span class="peer-badge peer-badge-yes">A ${escapeHtml(who)} le interesó</span>`;
}

function renderCard(op) {
  const tags = (op.evidence || [])
    .map((reason) => `<span class="opp-tag">${escapeHtml(reason)}</span>`)
    .join("");
  const link = op.secop_url
    ? `<a href="${escapeHtml(op.secop_url)}" target="_blank" rel="noopener">Abrir en SECOP II</a>`
    : "No informado";
  const peerBadges = (op.peer_decisions || []).map(peerDecisionBadge).join("");
  const forwardLabel = FORWARD_TARGET_LABEL[currentUser];
  const priorityLabel = PRIORITY_LABEL[op.priority] || null;

  const card = document.createElement("article");
  card.className = `opp-card priority-${op.priority || 4}`;
  card.dataset.id = op.id;
  card.innerHTML = `
    ${priorityLabel ? `<span class="priority-badge">${escapeHtml(priorityLabel)}</span>` : ""}
    <div class="opp-entity">${escapeHtml(op.entity || "Entidad no informada")}</div>
    <div class="opp-reference">${escapeHtml(op.reference || "")}</div>
    ${peerBadges ? `<div class="opp-peer-badges">${peerBadges}</div>` : ""}
    <p class="opp-object">${escapeHtml(op.object || "")}</p>
    <dl class="opp-meta">
      <div><dt>Valor</dt><dd>${formatMoney(op.value)}</dd></div>
      <div><dt>Ubicación</dt><dd>${escapeHtml(op.location || "No informada")}</dd></div>
      <div><dt>Estado / fase</dt><dd>${escapeHtml(op.procedure_state || "")} · ${escapeHtml(op.phase || "")}</dd></div>
      <div><dt>Fecha de ofertas</dt><dd>${formatDateEs(op.offer_deadline)}</dd></div>
      <div><dt>Código UNSPSC</dt><dd>${escapeHtml(op.unspsc_code || "No informado")}</dd></div>
      <div><dt>Portal</dt><dd>${link}</dd></div>
    </dl>
    <div class="opp-actions">
      <button class="opp-btn opp-btn-interesa" data-action="interesa">Me interesa</button>
      <button class="opp-btn opp-btn-no" data-action="no_interesa">No me interesa</button>
      ${forwardLabel ? `<button class="opp-btn opp-btn-forward" data-action="forward">Enviar a ${escapeHtml(forwardLabel)}</button>` : ""}
    </div>
    ${tags ? `<div class="opp-tags">${tags}</div>` : ""}
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

async function forward(opportunityId) {
  const response = await fetch("/api/forward", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ opportunity_id: opportunityId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo enviar el correo.");
  }
}

function updateCount() {
  const newToday = opportunities.filter((op) => isToday(op.created_at)).length;
  countEl.textContent = `${opportunities.length} oportunidad(es) pendiente(s) · ${newToday} nueva(s) hoy`;
}

function removeCard(id) {
  opportunities = opportunities.filter((op) => String(op.id) !== String(id));
  const card = listEl.querySelector(`[data-id="${id}"]`);
  if (card) card.remove();
  if (!opportunities.length) {
    listEl.innerHTML = '<p class="app-empty">No hay oportunidades pendientes por revisar.</p>';
  }
  updateCount();
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
  const action = button.dataset.action;

  if (action === "no_interesa") {
    openModal(id);
    return;
  }

  if (action === "forward") {
    button.disabled = true;
    try {
      await forward(id);
      button.textContent = "Enviado ✓";
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
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
    const body = await response.json();
    currentUser = body.user;
    opportunities = body.opportunities;
    userEl.textContent = currentUser;
    adminLink.hidden = currentUser !== "diego";
    listEl.innerHTML = "";
    if (!opportunities.length) {
      listEl.innerHTML = '<p class="app-empty">No hay oportunidades pendientes por revisar.</p>';
    } else {
      opportunities.forEach((op) => listEl.appendChild(renderCard(op)));
    }
    updateCount();
  } catch (error) {
    countEl.textContent = error.message;
  }
}

load();
