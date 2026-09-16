# Revisión de la tarjeta premium

Rama exclusiva: `card-v2-premium-lead-engine`. No se modifica `main`, no hay despliegue ni merge.

## Cómo verla

- Descargue `PREVIEW.html` y ábralo en su navegador. Es una copia autónoma de revisión con los mismos estilos y funciones; no necesita instalar dependencias.
- `desktop-hero.jpg`, `mobile-hero.jpg`, `desktop.jpg` y `mobile.jpg` muestran la implementación real probada.
- Para revisar la PWA: desde la raíz del repositorio ejecute `python3 -m http.server 8000` y visite `http://localhost:8000/tarjeta/?src=revision&utm_campaign=card-v2`. Use localhost o HTTPS para el service worker.

La vista autónoma no registra un service worker. Los enlaces de compartir y el QR apuntan al dominio real; mientras William no apruebe publicar, ese dominio sigue mostrando la tarjeta anterior. Los botones de WhatsApp, teléfono y correo abren servicios reales cuando usted los pulsa. Las pruebas no enviaron mensajes.

## Continuidad con la tarjeta original

Se conserva la foto, los cinco recursos de áreas, nombre, teléfono, correo, dirección de vCard, Florida 2-15 / 0215, licencia G369134, NPN 22325493, lema, trato en español, atención presencial/virtual, seis áreas originales, lista «Cómo trabajo» y aviso informativo. Los archivos JPG y el icono originales permanecen intactos.

DIME mantiene exactamente D + I × 10 + H + N × 40,000 + 15,000. Ahora presenta supuestos, validación, desglose y un mensaje de WhatsApp que incluye solo el total. Los campos empiezan vacíos, sin atribuir al visitante cifras de ejemplo. Se conserva el dictado cuando el navegador lo permite.

El carrusel conserva Vida, Medicare, Salud, Accidentes, Asesoría personal y Anualidades. Se retiran el desplazamiento continuo, clones y animaciones perpetuas. Las leyendas genéricas de Accidentes y Anualidades se reformulan como invitaciones a conversar para evitar interpretarlas como garantías de beneficios.

No se inventaron aseguradoras, afiliaciones, primas, beneficios, rendimientos o testimonios. No se afirma haber verificado externamente el estado actual de la licencia; se conserva el identificador original y se facilita el enlace de consulta oficial.

## Qué cambia

- Hero editorial con la misma fotografía, composición específica para móvil, Fraunces e Inter alojadas localmente, azul marino y dorado, SVG consistentes y vidrio discreto.
- Selector de Vida, Salud, Medicare y Retiro con contenido y WhatsApp contextual; acceso persistente al bajar; contacto por correo y teléfono.
- Formulario breve con nombre, teléfono, interés, horario, método y consentimiento. Validación y revisión antes de salir de la tarjeta.
- QR generado en el dispositivo, margen blanco, descarga PNG y copia del enlace. Web Share y alternativas cuando compartir o el portapapeles no están disponibles.
- vCard original con escape y plegado UTF-8 correctos; descarga sin afirmar que ya se guardó en contactos.
- PWA con precarga de recursos locales, navegación offline, instalación y cachés limitadas a la tarjeta. NFC con `#nfc`, solo tras pulsar el botón.
- Diálogos nativos, teclado/Escape/foco, estados de validación, enlaces esenciales sin JS, movimiento reducido y recursos WebP.

## Captación y medición: estado real

**No existe un backend de prospectos en este repositorio.** El Worker de voz existente no es un servicio de leads y no se modifica. El formulario prepara un correo a `wperezmedero@gmail.com`; el visitante debe abrir su aplicación y enviarlo. El texto dice «Solicitud preparada. Falta enviarla». No se afirma recepción, reserva de cita ni entrega.

Para almacenar prospectos se necesita un endpoint aprobado, validación en servidor, control de abuso, almacenamiento y política de retención, gestión del consentimiento y confirmación real de entrega. La interfaz está separada en `card.js` para conectar ese flujo sin rehacer el diseño. Hasta entonces, WhatsApp, llamada y correo son los canales reales.

`src`, `utm_source`, `utm_medium`, `utm_campaign` y `utm_content` se validan y se mantienen temporalmente en sessionStorage durante 30 minutos. Una campaña nueva reemplaza la anterior. Solo se aceptan etiquetas de 1–64 caracteres alfanuméricos, guion, punto o guion bajo; se rechazan números largos y caracteres de correo/HTML. No se guardan campos del formulario ni cifras de DIME. Enlaces QR/compartir conservan la campaña y el interés elegido; sin `src`, usan `qr` o `compartir`.

Se preparan doce eventos en `window.dataLayer` y `card:analytics`: `card_view`, `cta_main_click`, `service_selected`, `whatsapp_click`, `phone_click`, `save_contact`, `share_card`, `qr_open`, `calculator_start`, `calculator_complete`, `lead_form_open` y `lead_form_submit`. No hay IDs ni proveedor de Analytics inventados. `lead_form_submit` tiene `status: prepared` y `delivery: manual_email`; no debe contabilizarse como un lead recibido. Los eventos no contienen nombre, teléfono, deuda, ingreso ni resultado monetario.

## Archivos

Modificados: `tarjeta/index.html`, `tarjeta/app.webmanifest`, `tarjeta/sw.js`.

Agregados: `tarjeta/card.css`, `tarjeta/card.js`; `tarjeta/assets/` con variantes WebP, iconos, fuentes y licencias; `tarjeta/vendor/` con generador QR y licencias; `tarjeta/review/` con auditoría, instrucciones, pruebas, resultados, capturas y vista autónoma.

## Pruebas

`checks.json` recoge los resultados de la batería funcional en Chromium. Se prueban las cuatro necesidades, mensajes de WhatsApp, enlaces, DIME con límites y errores, formulario/consentimiento/correo/copia, vCard descargada, QR descargado y decodificado por software, compartir, doce eventos, datos fuera del almacenamiento, caché offline, ausencia de peticiones externas y consola limpia.

Revisión visual y axe WCAG A/AA a 1440, 390, 320, 768 y 720 píxeles CSS (este último para reflujo equivalente a una ventana de 1440 con zoom 200%). También diálogos, foco, Escape, movimiento reducido y contacto sin JavaScript. Las capturas reflejan la última pasada de composición, espaciado y áreas táctiles.

`migration.cjs` reproduce la actualización desde el commit original (requiere ese commit en el historial local); `extra-checks.json` registra migración desde la PWA v1, Web Share, cancelación y portapapeles denegado. `lighthouse.json` contiene mediciones de laboratorio en móvil simulado y servidor local. Los valores de producción dependen de la red y el alojamiento.

Reproducción: instale `playwright`, `axe-core`, `jsqr` y `pngjs` como dependencias de desarrollo en un entorno de pruebas, instale Chromium para Playwright y ejecute `node tarjeta/review/smoke.cjs`. Se admiten rutas `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `AXE_SCRIPT`, `JSQR_MODULE` y `PNG_MODULE` para entornos con dependencias preinstaladas. `QA_OUTPUT` permite guardar resultados fuera del repositorio.

Pendiente de comprobación en dispositivos reales: instalación en iOS/Safari, dictado con permiso de micrófono y escritura de un sticker NFC compatible. No se realizaron envíos de WhatsApp, correos ni llamadas reales.

La vista autónoma también se abrió como archivo local y se comprobaron selector, DIME, QR y formulario, sin errores de consola.

## Rendimiento final

Lighthouse 13.4.1 con Chromium 138, móvil simulado: Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**. LCP **2.21 s**, FCP **1.33 s**, TBT **0 ms**, CLS **0.00029**. Son mediciones de laboratorio local. Se usó Chromium 138 para evitar un fallo de medición `NO_LCP` de Lighthouse con Chromium 153; la batería funcional también pasó en Chromium 153.

Para repetir la medición, instale también `lighthouse` y `chrome-launcher`, y ejecute `node tarjeta/review/performance.cjs`; `CHROMIUM_PATH` permite indicar Chromium 138.
