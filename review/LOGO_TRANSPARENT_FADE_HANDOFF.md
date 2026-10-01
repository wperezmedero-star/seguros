# Entrada WP transparente y fade-out — 1 octubre 2026

## Decisión de William / instrucciones vigentes para Astra

La pantalla de entrada debe mostrar el mismo WP dorado de la tarjeta física corregida, con transparencia real y sin el recuadro azul ni el marco del símbolo. La salida solicitada es de opacidad 1 a 0 en 300–400 ms; se fija en 350 ms.

Activo: assets/brand/wp-card-transparent-768.webp, WebP sin pérdida de 768 × 768 px convertido desde approved-WP-transparent.png usado en la tarjeta. No es un logo nuevo. Canal alfa y las cuatro esquinas transparentes verificados. Fondo general de pantalla navy #0A192F; contenedor del símbolo transparente y sin borde.

Se conserva la formación progresiva suave con máscaras adaptadas a las proporciones del monograma. Las capas parciales se retiran al completar el logo, de modo que el estado final muestra únicamente la imagen completa. Espera de 2900 ms seguida de fade-out de 350 ms, duración total 3250 ms. Se conserva movimiento reducido y una entrada por sesión con clave v4. Inicio, Protección, Calculadoras, Preguntas y Sobre mí usan el nuevo recurso con preload; CSS versionada logo-transparent-fade-v4.

## Verificación

Chromium, vistas 1440 × 1000 y 390 × 844: imagen decodificada; fondo del símbolo transparente y border 0; logo completo sin capas duplicadas; fade de 350 ms con opacidad 1 al comienzo, intermedia durante y 0 al finalizar; capa oculta al terminar y contenido disponible. Movimiento reducido: pantalla de marca oculta. Cero errores JavaScript de página. Capturas revisadas visualmente.

Informe: LOGO_TRANSPARENT_FADE_QA.json. Capturas: screenshots/logo-transparent-desktop.png y screenshots/logo-transparent-mobile.png.

Agent-browser no pudo iniciar su daemon; la verificación se completó con Playwright y Chromium instalado desde el paquete npm oficial @sparticuz/chromium. No se ha comprobado en Safari de iPad físico.

## Entrega

Rama logo-transparente-fade-20261001, basada en main da46a5d. Preparada para revisión; sin fusión ni publicación automática bajo la indicación de William.
