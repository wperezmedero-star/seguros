# Growth v1 — opción de recepción con Formspree (29 septiembre 2026)

La captura de la cuenta de Cloudflare mostró que Email Sending requiere Workers Paid. William eligió la alternativa gratuita de Formspree. Esta rama **no está publicada**. El envío automático está activado únicamente en la rama con `leadProvider: 'formspree'` y el endpoint público `https://formspree.io/f/xkjgywrr`. En producción se conserva el correo manual hasta la aprobación y publicación de Growth v1.

## Qué se preparó

- `growth.js` acepta exclusivamente un endpoint `https://formspree.io/f/<id>` cuando `leadProvider` sea `formspree`; no acepta otros destinos arbitrarios ni coloca claves privadas en el navegador.
- Envía por HTTPS los campos ya existentes, consentimiento y origen con `FormData` y `Accept: application/json`. Deshabilita el botón durante el envío, muestra éxito solo si Formspree devuelve HTTP correcto, conserva los datos ante error o interrupción y permite llamar a William.
- No carga Turnstile de Cloudflare en esta opción. La protección anti-spam se configura en el panel Formspree. El Worker de voz no se modifica; el receptor Cloudflare preparado sigue aislado e inactivo.
- La página de privacidad explica el tercero y el historial de 30 días del plan gratuito. La aceptación del servicio no garantiza entrega del aviso al buzón.

## Verificación completada

- Cuenta Free creada y `wperezmedero@gmail.com` verificado como destinatario.
- Formulario «Solicitudes Web - William Perez Seguros» creado con el endpoint configurado en la rama.
- El 29 de septiembre de 2026 a las 12:57 UTC, una solicitud con datos ficticios recibió HTTP 200 y `{"ok":true}`.
- Gmail recibió en Recibidos el aviso «New submission from Solicitudes Web - William Perez Seguros» con todos los campos de la prueba.
- William guardó la restricción del proyecto a `williamperezseguros.com`; el valor persistió tras recargar el panel. El formulario y el archivo de envíos están habilitados; Formshield está activo y CAPTCHA desactivado.
- En «Flujo de trabajo» se ve una acción de correo por cada envío dirigida a la cuenta `wperezmed...`; la recepción de la prueba en Gmail confirma el destinatario.
- Se revisaron el consentimiento obligatorio en ambas superficies y la política de privacidad; la rama describe ahora el envío directo con Formspree en tiempo presente.

## Pendiente antes de publicar

1. Probar desde el dominio final una solicitud no sensible, la confirmación visible, el panel Formspree y el correo recibido. Probar también error y red interrumpida. La restricción por dominio usa el encabezado Referer y no sustituye una autenticación real.
2. Presentar la versión Growth v1 para aprobación final de William antes de publicarla.

Fuentes oficiales consultadas: https://formspree.io/plans/ ; https://help.formspree.io/articles/building-your-form/building-an-html-form ; https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain ; https://help.formspree.io/articles/form-and-project-settings/protecting-your-forms-with-cloudflare-turnstile .
