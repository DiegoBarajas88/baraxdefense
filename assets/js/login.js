const form = document.getElementById("loginForm");
const errorEl = document.getElementById("loginError");
const submitBtn = document.getElementById("loginSubmit");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";
  submitBtn.disabled = true;

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      errorEl.textContent = body.error || "No se pudo iniciar sesión.";
      submitBtn.disabled = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get("next") || "/oportunidades";
  } catch {
    errorEl.textContent = "Error de conexión. Intenta de nuevo.";
    submitBtn.disabled = false;
  }
});
