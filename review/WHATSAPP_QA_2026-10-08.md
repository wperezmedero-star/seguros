# Corrección mínima de medición y fricción de idioma

Fecha de comprobación: 2026-10-08. Rama propuesta: `codex/captacion-whatsapp-20261008`.

## Problema reproducido

La página inicial ya marca enlaces con `data-growth-event="whatsapp_lead"`, pero la lista permitida de `assets/js/growth.js` no contenía ese evento. El manejador compartido descartaba el clic sin emitir `wps:analytics` ni añadirlo a `dataLayer`.

## Cambios

- Añadir únicamente `whatsapp_lead` a la lista permitida, conservando la exclusión de datos personales.
- Avisar junto al CTA de Vida que el recorrido de Ethos puede aparecer en inglés y orientar hacia el WhatsApp existente para atención en español.
- Incorporar tres pruebas sin red, que ejecutan el script real con un DOM mínimo.

No se modifican URL de Ethos, teléfono, formularios, proveedor de contacto, estilos, credenciales ni configuración de despliegue. No se añade un servicio de analítica ni se afirma que exista un historial persistente de clics.

## Verificación

```sh
node --test review/whatsapp-event.test.cjs
node --check assets/js/growth.js
git diff --check
```

La prueba principal falla con el script anterior y pasa después de la corrección. Resultado final: 3 pruebas aprobadas; sintaxis y diff sin errores. Se conservan eventos de cotización y contacto. Propiedades no permitidas y valores personales ficticios no pasan al evento.

Vista previa local comprobada a 390 × 844 y 1440 × 1000: aviso presente, CTA existente conservado, sin desbordamiento horizontal del documento. Prueba visual en Chromium; no sustituye una prueba real en Safari/iPad.

Para probar la interfaz del formulario se usó una configuración local manual sin endpoint, exclusivamente en el servidor de vista previa y sin alterar el archivo de configuración del repositorio. Se verificó bloqueo sin consentimiento, cambio de requisito teléfono/email y preparación de correo con datos ficticios. No se envió un correo ni una solicitud a Formspree. Recepción real y notificación al propietario: pendientes de prueba autorizada.

## Puesta en producción

Mantener como propuesta en borrador. No fusionar a `main` ni desplegar sin aprobación específica del propietario. Después de una aprobación y despliegue, repetir las pruebas públicas y verificar por separado el destino persistente de analítica.
