"use strict";

(() => {
  const message = document.getElementById("connection-message");
  const setupHelp = document.getElementById("setup-help");
  const openLink = document.getElementById("open-classctrl");
  const cancelRedirectButton = document.getElementById("cancel-redirect");
  const createTechLink = document.getElementById("create-tech-account");
  const centralSetupHelp = document.getElementById("central-setup-help");
  const retryButton = document.getElementById("retry-connection");
  const configuredUrl = window.CLASSCTRL_CONFIG?.serverUrl;
  const centralRegisterUrl = window.CLASSCTRL_CONFIG?.centralRegisterUrl;
  let redirectTimer;
  let redirectCancelled = false;

  function cancelAutomaticRedirect() {
    redirectCancelled = true;
    if (redirectTimer !== undefined) {
      window.clearTimeout(redirectTimer);
      redirectTimer = undefined;
      message.querySelector("span:last-child").textContent =
        "Redirección cancelada. Puedes iniciar sesión o usar el registro técnico.";
    }
    cancelRedirectButton.hidden = true;
  }

  try {
    const registration = new URL(centralRegisterUrl);
    if (
      registration.protocol !== "https:" ||
      !registration.hostname ||
      registration.username ||
      registration.password ||
      registration.search ||
      registration.hash
    ) {
      throw new Error("Dirección de registro no válida");
    }
    createTechLink.href = registration.toString();
    createTechLink.removeAttribute("aria-disabled");
    createTechLink.removeAttribute("tabindex");
    createTechLink.removeAttribute("aria-describedby");
    centralSetupHelp.hidden = true;
  } catch {
    createTechLink.removeAttribute("href");
    createTechLink.setAttribute("aria-disabled", "true");
    centralSetupHelp.hidden = false;
  }

  createTechLink.addEventListener("click", (event) => {
    cancelAutomaticRedirect();
    if (createTechLink.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });
  createTechLink.addEventListener("focus", cancelAutomaticRedirect);
  openLink.addEventListener("focus", cancelAutomaticRedirect);
  openLink.addEventListener("click", cancelAutomaticRedirect);
  cancelRedirectButton.addEventListener("click", () => {
    cancelAutomaticRedirect();
    message.querySelector("span:last-child").textContent =
      "Redirección cancelada. Puedes continuar al inicio de sesión o usar el registro técnico.";
  });

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
      const animationUrl = new URL(animatedLogo.dataset.animationSrc, document.baseURI);
      animationUrl.searchParams.set("v", "2");
      animationUrl.searchParams.set("cycle", Date.now().toString());
      animatedLogo.src = animationUrl.toString();
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
      message.querySelector("span:last-child").textContent = redirectCancelled
        ? "ClassCtrl está disponible. La redirección automática está cancelada; puedes iniciar sesión o usar el registro técnico."
        : "ClassCtrl está disponible. Serás redirigido para iniciar sesión.";
      openLink.hidden = false;
      const animationDelay = reduceMotion
        ? 0
        : Math.max(0, 5000 - (Date.now() - checkStartedAt));
      if (!redirectCancelled) {
        cancelRedirectButton.hidden = false;
        redirectTimer = window.setTimeout(
          () => window.location.assign(destination),
          animationDelay,
        );
      }
    } catch (error) {
      visual.classList.add("animation-failed");
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

  retryButton.addEventListener("click", () => {
    redirectCancelled = false;
    cancelRedirectButton.hidden = true;
    return checkServer();
  });
  checkServer();
})();
