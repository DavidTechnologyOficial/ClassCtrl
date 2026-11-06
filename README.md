# Entrada pública de ClassCtrl

Esta carpeta contiene únicamente una página estática de entrada para GitHub Pages. No incluye servidor, usuarios ni credenciales.

Antes de publicar, configura `serverUrl` en `config.js` con la dirección HTTPS pública vigente del túnel. La página dirige al inicio de sesión del servidor; la dirección del navegador cambiará al continuar. Si el servidor está apagado, el navegador mostrará un error de conexión.

`centralRegisterUrl` solo debe configurarse con el URL HTTPS real del servicio central desplegado. Mientras esté vacío, el enlace “Crear cuenta de técnico” permanecerá visible, pero deshabilitado y acompañado por el aviso de configuración; no lo apuntes al servidor institucional ni a localhost. El acceso automático al servidor institucional se conserva, puede cancelarse con su botón accesible y se cancela al enfocar o abrir el registro cuando este está configurado.

Consulta el README de la raíz del proyecto para el proceso de publicación y las precauciones del túnel.

Los archivos de marca se preparan desde `Asets/` conservando allí los originales. `Classctrl_animation.svg` y `Classctrl.svg` se copian sin cambios. El icono `Classctrl_ sin texto.svg` se publica como `assets/Classctrl_sin_texto.svg` con el `viewBox` normalizado a `136 176 228 148`: su SVG original tiene un lienzo de 500×500 sin `viewBox` y márgenes blancos simétricos que hacían que el icono se viera demasiado pequeño. Mantén esta asignación y normalización al actualizar las copias públicas.
