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
  const centralLoginUrl = window.CLASSCTRL_CONFIG?.centralLoginUrl;
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

  let server;
  let destination;
  try {
    server = new URL(configuredUrl);
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

    const login = new URL(centralLoginUrl);
    if (
      login.protocol !== "https:" ||
      login.origin !== server.origin ||
      login.pathname !== "/cuentas/login/" ||
      login.username ||
      login.password ||
      login.search ||
      login.hash
    ) {
      throw new Error("Dirección de inicio de sesión central no válida");
    }
    destination = login.toString();
  } catch {
    message.querySelector("span:last-child").textContent =
      "Falta configurar la URL HTTPS del servicio central y su inicio de sesión.";
    setupHelp.hidden = false;
    createTechLink.removeAttribute("href");
    createTechLink.setAttribute("aria-disabled", "true");
    centralSetupHelp.hidden = false;
    return;
  }

  try {
    const registration = new URL(centralRegisterUrl);
    if (
      registration.protocol !== "https:" ||
      registration.origin !== server.origin ||
      registration.pathname !== "/cuentas/registro/" ||
      registration.username ||
      registration.password ||
      registration.search ||
      registration.hash
    ) {
      throw new Error("Dirección de registro central no válida");
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

  const healthUrl = `${server.origin}/health/`;
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
      "Comprobando la disponibilidad del servidor central…";
    if (!reduceMotion) {
      visual.classList.remove("animation-failed");
      const animationUrl = new URL(animatedLogo.dataset.animationSrc, document.baseURI);
      animationUrl.searchParams.set("v", "3");
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
      if (result.status !== "ok" || result.service !== "central") {
        throw new Error("El destino no confirmó que sea el servicio central.");
      }
      message.querySelector("span:last-child").textContent =
        `CLASSCTRL — SERVIDOR CENTRAL\n` +
        `Estado: disponible\n` +
        `URL pública: ${server.origin}\n\n` +
        `GitHub Pages:\n` +
        `Configuración local actualizada.\n` +
        `Pendiente subir los archivos indicados al repositorio.\n\n` +
        `Mantén funcionando el servidor central y su túnel.` +
        (redirectCancelled ? "\nRedirección automática cancelada." : "");
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
          ? "El servicio central tardó demasiado. Comprueba que el servidor y su túnel estén activos."
          : error.message === "El destino no confirmó que sea el servicio central."
            ? "La URL respondió, pero no identificó el servicio central. No se realizará la redirección."
            : "No se pudo conectar con el servicio central. Comprueba el servidor y vuelve a intentar.";
      openLink.hidden = true;
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
