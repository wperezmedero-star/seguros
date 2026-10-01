# Continuidad de marca y recepción — 28 septiembre 2026

## Activo aprobado por William

Original leído e inspeccionado: **Logotipo Dorado WP sobre Fondo Azul Marino.png**, Library `libfile_64d9cf0684b08191a0c28b174b84a627`, versión 0, 1254 × 1254. Iniciales WP entrelazadas doradas, nombre William Pérez-Mederos, agente de seguros licenciado, Vida · Salud · Retiro y lema.

`assets/brand/wp-approved-20260928.webp` conserva los píxeles RGBA del PNG original, verificados por comparación tras conversión sin pérdidas. No es una recreación generada. Las versiones 256 y 768 son derivados reducidos para rendimiento (aprox. 10 y 50 KB). El original completo no se descarga en las páginas.

Cabeceras: encuadre CSS de las iniciales del mismo archivo, sin deformar ni redibujar. Pies de página: composición completa con texto alternativo; no se sustituye la fotografía. Aplicado en las cinco páginas principales, privacidad y tarjeta. QR, retrato y tarjeta 3D conservados. El service worker incluye las dos variantes web. No se cambiaron iconos de instalación/favicon ni se generaron archivos de imprenta: esos tamaños requieren adaptación específica, no reducir automáticamente todo el cartel.

**Instrucción para Astra y futuros colaboradores:** esta es la identidad aprobada para continuar web, tarjeta física/digital y redes. Reutilizar el original, no generar un logo diferente ni importar otra tarjeta a ciegas. Documento disponible en la rama; no se afirma haber enviado mensajes a colaboradores externos.

## Recepción directa

Se añadió `services/leads/worker.mjs`, configuración y guía. La integración cliente incluye Turnstile cuando se configure el receptor. Preparada y probada localmente, **no activa**. Ver [guía operativa](../services/leads/README.md).

Pendientes: acceso a la cuenta Cloudflare, remitente y destino verificados, claves reales, activación autorizada, prueba de recepción real. El correo manual continúa como recorrido honesto mientras tanto. La web y main no se publicaron ni modificaron.

## Archivos de esta actualización

- Marca/HTML: `index.html`, `proteccion.html`, `calculadoras.html`, `sobre-mi.html`, `preguntas.html`, `privacidad.html`, `tarjeta/index.html`.
- Estilos/caché: `assets/css/growth.css`, `tarjeta/sw.js`.
- Activos: los tres archivos `assets/brand/wp-approved-*.webp` descritos arriba.
- Integración: `assets/js/growth.js`, `assets/js/growth-config.js`.
- Receptor: `services/leads/worker.mjs`, `services/leads/wrangler.jsonc`, `services/leads/README.md`.
- Evidencia: este documento; informe Growth actualizado; `review/leads-receiver.test.mjs`, `review/LEADS_RECEIVER_QA.txt`, `review/brand-leads-browser.cjs`, `review/BRAND_LEADS_QA.json`; suite `review/growth-qa.cjs` y su reporte actualizado; cuatro capturas de portada/tarjeta actualizadas y dos nuevas de los pies con el logo completo.

Safari y dispositivos físicos siguen pendientes; Chromium responsive no los sustituye. Los servicios externos del receptor fueron simulados en las pruebas.
