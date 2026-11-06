"use strict";

(() => {
  const message = document.getElementById("connection-message");
  const setupHelp = document.getElementById("setup-help");
  const openLink = document.getElementById("open-classctrl");
  const retryButton = document.getElementById("retry-connection");
  const configuredUrl = window.CLASSCTRL_CONFIG?.serverUrl;

  let destination;
  let healthUrl;
  try {
    const server = new URL(configuredUrl);
    if (
      server.protocol !== "https:" ||
      !server.hostname ||
      server.username ||
      server.password ||
      server.search ||
      server.hash ||
      server.pathname !== "/"
    ) {
      throw new Error("Dirección no válida");
    }

    destination = `${server.origin}/cuentas/login/`;
    healthUrl = `${server.origin}/health/`;
  } catch {
    message.querySelector("span:last-child").textContent =
      "Falta configurar una dirección HTTPS válida del servidor.";
    setupHelp.hidden = false;
    return;
  }

  setupHelp.hidden = true;
  openLink.href = destination;
  retryButton.hidden = false;

  const animatedLogo = message.querySelector(".loading-animation");
  const visual = message.querySelector(".loading-visual");
  animatedLogo.addEventListener("error", () => {
    visual.classList.add("animation-failed");
  }, { once: true });

  async function checkServer() {
    const checkStartedAt = Date.now();
    const reduceMotion = Boolean(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    );
    retryButton.disabled = true;
    openLink.hidden = true;
    message.querySelector("span:last-child").textContent =
      "Comprobando la disponibilidad del servidor…";
    if (!reduceMotion) {
      visual.classList.remove("animation-failed");
      animatedLogo.src = `${animatedLogo.dataset.animationSrc}?cycle=${Date.now()}`;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(healthUrl, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`El servidor respondió con HTTP ${response.status}.`);
      }
      const result = await response.json();
      if (result.status !== "ok") {
        throw new Error("La respuesta de salud no es válida.");
      }
      message.querySelector("span:last-child").textContent =
        "ClassCtrl está disponible. Serás redirigido para iniciar sesión.";
      openLink.hidden = false;
      const animationDelay = reduceMotion
        ? 0
        : Math.max(0, 5000 - (Date.now() - checkStartedAt));
      window.setTimeout(() => window.location.assign(destination), animationDelay);
    } catch (error) {
      message.querySelector("span:last-child").textContent =
        error.name === "TimeoutError" || error.name === "AbortError"
          ? "El servidor tardó demasiado. Comprueba que el túnel esté activo."
          : "No se pudo conectar con ClassCtrl. Comprueba el servidor y vuelve a intentar.";
      openLink.hidden = false;
      setupHelp.hidden = true;
    } finally {
      window.clearTimeout(timeout);
      retryButton.disabled = false;
    }
  }

  retryButton.addEventListener("click", checkServer);
  checkServer();
})();
