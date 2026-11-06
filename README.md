# Entrada pública de ClassCtrl

Esta carpeta contiene únicamente una página estática de entrada para GitHub Pages. No incluye servidor, usuarios ni credenciales.

Antes de publicar, configura `serverUrl`, `centralLoginUrl` y `centralRegisterUrl` en `config.js` con el mismo origen HTTPS público del servicio central. La entrada valida que `/health/` responda `{"status":"ok","service":"central"}` antes de ofrecer el login o redirigir. La ruta de acceso central es `/cuentas/login/`; el registro es `/cuentas/registro/`. Una respuesta institucional no pasa la verificación y no produce una redirección.

Mientras las URL centrales estén vacías, el registro permanece visible pero deshabilitado y no hay redirección. Al comprobar la salud, la página muestra el URL central, el estado de publicación pendiente y un botón para cancelar la redirección automática. El enlace de registro cancela también la redirección al recibir foco o al abrirse.

Consulta el README de la raíz del proyecto para el proceso de publicación y las precauciones del túnel.

Los archivos de marca se preparan desde `Asets/` conservando allí los originales. `Classctrl_animation.svg` y `Classctrl.svg` se copian sin cambios. El icono `Classctrl_ sin texto.svg` se publica como `assets/Classctrl_sin_texto.svg` con el `viewBox` normalizado a `136 176 228 148`: su SVG original tiene un lienzo de 500×500 sin `viewBox` y márgenes blancos simétricos que hacían que el icono se viera demasiado pequeño. Mantén esta asignación y normalización al actualizar las copias públicas.
