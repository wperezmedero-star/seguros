# Premium Luminous + Motion Pass — revisión

Rama: `card-v2-premium-lead-engine`.

Esta pasada combina la arquitectura comercial de la Card Premium con la energía visual útil de la tarjeta original, pero corrige dos problemas detectados en revisión: exceso de fondo oscuro continuo y transparencias que podían reducir la lectura.

## Arquitectura protegida

- `card-core.css` conserva el CSS funcional premium base.
- `card-core.js` conserva la lógica verificada de selector, WhatsApp contextual, DIME, formulario, vCard, compartir, QR, UTMs, analytics y PWA.
- `card.css` añade la nueva dirección visual y motion design sin reescribir la lógica principal.
- `card.js` carga la lógica verificada y después activa iconografía educativa y movimiento progresivo.
- Si falla la capa de motion, el contenido y las funciones principales continúan disponibles.

## Dirección visual: Premium Luminous Editorial

- hero y cierre mantienen azul marino profundo y dorado;
- la zona de necesidades pasa a marfil/perla de alto contraste;
- `Cómo trabajo` recibe una segunda zona clara para crear ritmo visual;
- panel de respuesta por servicio permanece oscuro, sólido y claramente separado;
- DIME pasa a superficie clara sólida con jerarquía fuerte;
- contacto final vuelve a navy sólido;
- diálogos usan superficie clara casi opaca, sin depender del fondo para leer texto;
- inputs, selects y textareas se mantienen blancos con texto oscuro;
- se evita glassmorphism translúcido en cualquier bloque con información crítica.

## Iconografía educativa

Se sustituyen dinámicamente los cuatro iconos principales por SVG propios, consistentes y más identificables:

- Vida: escudo + corazón = protección familiar;
- Salud: tarjeta médica + pulso = cobertura de salud;
- Medicare: persona + credencial médica = orientación Medicare;
- Retiro: crecimiento/árbol + moneda = estabilidad futura.

Los iconos se presentan en fichas sólidas, con mayor tamaño y color semántico moderado para distinguir categorías sin perder coherencia premium. Las tarjetas fotográficas reciben una placa de icono sólida para mantener legibilidad sobre imagen.

## Motion premium

- ambiente dorado/azul sutil solo como apoyo;
- entrada cinematográfica de hero, retrato y credenciales;
- profundidad y reflejo controlado en retrato;
- feedback táctil en botones y tarjetas;
- revelado por scroll mediante `IntersectionObserver`;
- transición del selector de necesidad;
- animación del resultado DIME;
- entrada refinada de barra flotante;
- `prefers-reduced-motion` desactiva toda animación no esencial.

## Firma de interacción QR

La apertura del QR recibe una microexperiencia propia:

1. backdrop oscuro con halo dorado y blur;
2. panel claro sólido;
3. materialización con escala/profundidad;
4. QR entra después del panel;
5. línea dorada de escaneo recorre una sola vez el código;
6. acciones aparecen de forma escalonada;
7. cierre por botón, Escape o fondo usa una salida animada cuando el usuario no solicita movimiento reducido.

El QR sigue generándose localmente con la lógica premium existente; la capa visual no cambia sus datos ni su destino.

## PWA / offline

- `sw-core.js` usa caché `v2-premium-20260916-4` para invalidar CSS/JS anteriores;
- `card.css` y `card.js` quedan incluidos en la caché principal;
- `sw.js` conserva caché separada para `card-core.css` y `card-core.js`;
- no se cachean formularios, mensajes ni solicitudes externas.

## Estado

- `main` no se modificó ni se fusionó;
- la rama permanece por delante de `main` y 0 commits por detrás;
- no se considera lista para merge hasta repetir revisión visual/funcional final y validación en Safari/iPhone real.
