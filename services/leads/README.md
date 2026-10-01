# Recepción directa — preparada, no activada

El usuario pidió conectar los formularios existentes para recibir solicitudes directamente. Este servicio es independiente del Worker de voz. No se desplegó, no tiene credenciales reales y no se ha probado entrega a un buzón real.

## Recorrido implementado

Formulario de portada, calculadoras o tarjeta → POST `/api/leads` → validación de campos y consentimiento → límite regional de solicitudes → Turnstile validado en servidor (hostname y acción) → correo de texto a `wperezmedero@gmail.com` → `{accepted:true}` solo después de `EMAIL.send()` con `messageId`.

El destinatario es el correo ya publicado en el repositorio. Ningún visitante puede cambiarlo. No se manda confirmación automática al prospecto ni se guarda una base de datos. La aceptación del proveedor no demuestra entrega en Inbox o lectura: revisar rebotes/spam y realizar una prueba real antes de activar la web.

## Configuración pendiente en la cuenta Cloudflare

1. Acceder a la cuenta que administra `williamperezseguros.com`. No se encontró un conector Cloudflare utilizable en esta sesión. No pegar contraseñas, tokens ni secretos en GitHub o el chat.
2. Verificar que Email Service y el dominio remitente estén habilitados. Verificar `wperezmedero@gmail.com` como destino y completar la confirmación recibida en ese buzón. Revisar los registros existentes antes de cambiar DNS; no reemplazar registros de otro proveedor de correo.
3. Elegir un remitente real del dominio y ponerlo en `LEAD_FROM`. Se dejó vacío deliberadamente, no se inventó un buzón operativo.
4. Crear Turnstile para los hostnames `williamperezseguros.com` y `www.williamperezseguros.com`. Poner su secreto solo en el Worker como `TURNSTILE_SECRET_KEY`. La sitekey pública se configura en `assets/js/growth-config.js`.
5. Verificar que el namespace de rate limit propuesto `2026092801` no esté usado; cambiarlo si hace falta. Este contador limita a 60 solicitudes/minuto por ubicación de Cloudflare y usa una clave global del formulario. Es un freno regional, no una cuota global exacta ni una garantía contra todo abuso. No se almacena una IP en la aplicación.
6. Confirmar los permisos y la disponibilidad del binding nativo `send_email`, limitado al destinatario William. La API estructurada se documentó como beta al consultar las fuentes: verificar soporte en esta cuenta antes de activar.
7. **Después de autorización de despliegue:** crear el Worker separado con esta configuración y añadir únicamente la ruta `williamperezseguros.com/api/leads` (y `www` si corresponde). No tocar las rutas del asistente. Cambiar `LEADS_ENABLED` a `true` únicamente con las dependencias verificadas.
8. Realizar una prueba autorizada con datos de prueba no sensibles, comprobar recepción real en el buzón y respuesta desde los formularios. Probar token caducado, rechazo del proveedor y red interrumpida. No basta un resultado simulado.
9. Configurar `leadEndpoint: '/api/leads'` y la sitekey pública real en la rama. Publicar el frontend únicamente cuando el usuario autorice su publicación. Las previews en otro dominio deben permanecer en modo correo o usar una configuración de pruebas aislada; no ampliar CORS a `*`.

Hasta completar esto, `leadEndpoint` permanece vacío: el sitio conserva el correo manual y **no anuncia que la conexión está activa**. Publicar este código por sí solo no activa el receptor. No se añadieron workflows automáticos de despliegue.

## Datos y operaciones

- Solo campos permitidos, con validación en servidor; rechaza campos extra y texto de control. Tamaño máximo del cuerpo 8 KiB incluso sin Content-Length.
- Consentimiento obligatorio y versión `growth-v1`; fecha del servidor en el mensaje.
- CORS restringido no sustituye Turnstile. Token de uso único, hostname y acción comprobados.
- No logs de payload, no secretos en frontend, no CC/BCC controlados por visitante.
- Falla de forma cerrada si faltan bindings/configuración. El navegador conserva datos si falla la recepción.
- Sin reintentos automáticos de correo. Si se pierde la respuesta después de aceptar el envío, una repetición manual podría duplicar el correo. No se garantiza exactamente una entrega; revisar antes de evolucionar a CRM.
- William debe gestionar eliminación/retención en su correo y supervisar spam/rebotes. El servicio no decide elegibilidad, cotiza ni recomienda productos.

## Pruebas

`node --test review/leads-receiver.test.mjs` desde la raíz.

`review/brand-leads-browser.cjs`: navegador Chromium → handler real → servicios Cloudflare simulados para las tres superficies. Cubre token ausente/caducado, aceptación y limpieza. No envía correo real. Las pruebas de regresión generales siguen en `review/growth-qa.cjs`.

## Fuentes oficiales consultadas — 28 septiembre 2026

- Cloudflare [Workers email API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/) (página actualizada 16 septiembre 2026): binding estructurado y confirmación `messageId`.
- [Send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/): restricción del destinatario.
- [Server-side Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/): validación obligatoria, uso único y caducidad.
- [Client-side rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).
- [Rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/): binding, namespace y límites por ubicación.
