"use strict";

(() => {
  const message = document.getElementById("connection-message");
  const setupHelp = document.getElementById("setup-help");
  const openLink = document.getElementById("open-classctrl");
  const configuredUrl = window.CLASSCTRL_CONFIG?.serverUrl;

  let destination;
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
  } catch {
    message.textContent = "Falta configurar una dirección HTTPS válida del servidor.";
    setupHelp.hidden = false;
    return;
  }

  setupHelp.hidden = true;
  message.textContent = "Abriendo ClassCtrl. El servidor temporal debe estar encendido.";
  openLink.href = destination;
  openLink.hidden = false;
  openLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.assign(destination);
  });

  window.setTimeout(() => window.location.assign(destination), 1200);
})();
