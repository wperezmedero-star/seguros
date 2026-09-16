# Premium Motion Pass — revisión

Rama: `card-v2-premium-lead-engine`.

Esta pasada recupera la energía visual útil de la tarjeta original sin volver a los efectos continuos que competían con la lectura.

## Arquitectura

- `card-core.css` conserva exactamente el CSS premium que ya había pasado la revisión funcional y visual.
- `card-core.js` conserva exactamente la lógica premium verificada de selector, WhatsApp contextual, DIME, formulario, vCard, compartir, QR, UTMs, analytics y PWA.
- `card.css` importa el CSS verificado y añade una capa separada de motion design.
- `card.js` carga la lógica verificada y, después, activa la capa de movimiento de forma progresiva.
- Si la capa de movimiento no puede ejecutarse, el contenido y las funciones principales siguen disponibles.

## Motion añadido

- ambiente dorado/azul muy sutil en el fondo;
- entrada cinematográfica escalonada de hero, retrato y credenciales;
- profundidad y reflejo controlado en el retrato;
- feedback táctil y microinteracciones en CTA;
- tarjetas con elevación, zoom y brillo bajo interacción;
- revelado por scroll mediante `IntersectionObserver`;
- transición más rica del selector de necesidad;
- pulso de atención muy tenue en DIME;
- animación del resultado de DIME;
- entrada refinada de diálogos y barra flotante;
- `prefers-reduced-motion` desactiva toda animación no esencial.

## PWA / offline

La capa de motion mantiene los activos verificados en `card-core.css` y `card-core.js`. `sw.js` conserva el service worker premium original en `sw-core.js` y añade cache independiente para ambos archivos core, con respuesta cache-first cuando la tarjeta está sin conexión.

## Validación de esta pasada

- La lógica premium existente no fue reescrita: se conserva como blobs idénticos en `card-core.css` y `card-core.js`.
- Sintaxis JavaScript de `card.js`: OK con `node --check`.
- Sintaxis JavaScript de `sw.js`: OK con `node --check`.
- `main` no se modificó ni se fusionó.
- La rama continúa por delante de `main` y no está por detrás.

Antes de merge se debe repetir la batería visual/funcional completa sobre esta capa final, incluyendo Safari/iPhone real.
