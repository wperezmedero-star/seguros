# Logo WP — ensamblaje suave
Fecha: 2026-10-01
Estado: propuesta en rama separada; no publicada.

## Decisión aprobada por William
Conservar el WP dorado original. Al abrir la web, mostrar sus piezas ligeramente separadas y ensamblarlas suavemente hasta recuperar la imagen exacta. Fondo navy #0A192F, sin rectángulo blanco y sin sonido.

## Implementación para Astra y otros colaboradores
- Reutiliza assets/brand/wp-card-transparent-768.webp; no se ha creado ni sustituido el logo.
- Tres regiones contiguas recortan la imagen original. Se trasladan y giran suavemente hasta su posición original.
- Ensamblaje de 1.65 s con inicios escalonados de 80, 180 y 280 ms.
- Imagen completa visible a 2.05 s; desvanecimiento de la pantalla de 350 ms a partir de 2.4 s.
- Inicio, Protección, Calculadoras, Sobre mí y Preguntas usan la misma clave de sesión v5 y la misma versión CSS.
- La entrada solo se ejecuta una vez por sesión y no compite con las transiciones internas.
- Retirada de seguridad de la clase de entrada a 3.3 s. La pantalla no captura clics.
- No se modifican Ethos, formularios, voz, navegación ni tarjeta digital.
- Base: main en 681732ddc4d3906a1e6781e15071a4092b69e050, que ya contiene el PR #14.

## Validación y límite pendiente
Pasaron las comprobaciones del script de entrada en las cinco páginas: primera visita, visita repetida, reducir movimiento, llegada por transición interna y almacenamiento de sesión no disponible; también la retirada de seguridad.
Pendiente: revisión visual real en navegador en móvil y escritorio. Playwright no tiene Chromium instalado; el navegador remoto no admite la vista previa local ni URLs data. No afirmar que esa revisión visual está completada.
Antes de integrar, comprobar ensamblaje, ausencia de costuras perceptibles, pausa y desvanecimiento.
