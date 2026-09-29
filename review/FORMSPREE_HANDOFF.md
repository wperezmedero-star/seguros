# Growth v1 — opción de recepción con Formspree (29 septiembre 2026)

La captura de la cuenta de Cloudflare mostró que Email Sending requiere Workers Paid. William eligió preparar la alternativa gratuita de Formspree. Esta rama **no está publicada** y el envío automático **no está activado**: `assets/js/growth-config.js` mantiene `leadProvider: 'manual'` y el endpoint vacío. En producción se conserva el correo manual.

## Qué se preparó

- `growth.js` acepta exclusivamente un endpoint `https://formspree.io/f/<id>` cuando `leadProvider` sea `formspree`; no acepta otros destinos arbitrarios ni coloca claves privadas en el navegador.
- Envía por HTTPS los campos ya existentes, consentimiento y origen con `FormData` y `Accept: application/json`. Deshabilita el botón durante el envío, muestra éxito solo si Formspree devuelve HTTP correcto, conserva los datos ante error o interrupción y permite llamar a William.
- No carga Turnstile de Cloudflare en esta opción. La protección anti-spam se configura en el panel Formspree. El Worker de voz no se modifica; el receptor Cloudflare preparado sigue aislado e inactivo.
- La página de privacidad explica el tercero y el historial de 30 días del plan gratuito. La aceptación del servicio no garantiza entrega del aviso al buzón.

## Para activar después de verificar la cuenta

1. William crea o accede a su cuenta Formspree y verifica su email. No compartir contraseña ni códigos. Seleccionar plan Free; no contratar un plan pago.
2. Crear un formulario «Solicitudes William Pérez Seguros» con destino `wperezmedero@gmail.com`. En **Integration**, copiar únicamente el endpoint público del formulario. No copiar ninguna clave de API o URL de lectura de envíos.
3. En ajustes del proyecto, restringir a `williamperezseguros.com` sin `www` (cubre ambos hostnames); revisar la protección anti-spam. Esto usa el encabezado Referer y no sustituye una autenticación real.
4. Configurar en `assets/js/growth-config.js` `leadProvider: 'formspree'` y `leadEndpoint` con el endpoint real. Antes de publicar, probar una solicitud no sensible desde el dominio final, revisar la confirmación, el panel Formspree, el correo recibido y spam. Probar también error y red interrumpida. La prueba consume una de las 50 solicitudes mensuales del plan Free.
5. Solo entonces aprobar y publicar Growth v1; revisar la política de privacidad y el consentimiento del formulario de nuevo contra el servicio efectivamente configurado. No prometer respuesta inmediata ni afirmar entrega solo por un HTTP 2xx.

Fuentes oficiales consultadas: https://formspree.io/plans/ ; https://help.formspree.io/articles/building-your-form/building-an-html-form ; https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain ; https://help.formspree.io/articles/form-and-project-settings/protecting-your-forms-with-cloudflare-turnstile .
