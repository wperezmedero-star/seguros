# Astra 6 Handoff — Tarjeta Digital Premium / Lead Engine 2027

## Estado y alcance

Trabaja **solo** en la rama `card-v2-premium-lead-engine` del repositorio `wperezmedero-star/seguros`.

La versión publicada vive en `main`; **no modifiques ni fusiones a `main` sin aprobación expresa de William**.

URL de referencia actual:
- https://williamperezseguros.com/tarjeta/

Archivos actuales principales:
- `tarjeta/index.html` — implementación completa actual de la tarjeta
- `tarjeta/foto.jpg` — foto profesional actual
- `tarjeta/vida.jpg`
- `tarjeta/salud.jpg`
- `tarjeta/medicare.jpg`
- `tarjeta/anualidad.jpg`
- `tarjeta/accidente.jpg`
- `tarjeta/icono.png`
- `tarjeta/app.webmanifest`
- `tarjeta/sw.js`

El dominio se sirve desde este repositorio mediante `CNAME`.

## Misión

Transformar `/tarjeta/` en una tarjeta digital de seguros de vanguardia, mobile-first, premium, rápida y orientada a conversión. No debe parecer una plantilla ni una web corporativa genérica.

Debe funcionar simultáneamente como:
1. tarjeta profesional;
2. mini landing page;
3. sistema de captación de prospectos;
4. punto de entrada a Vida, Salud, Medicare y Retiro;
5. herramienta de WhatsApp inteligente;
6. tarjeta compartible/guardable con QR;
7. base preparada para medición de origen y conversiones.

## Identidad

Nombre: William Pérez-Mederos

Credenciales visibles existentes que deben conservarse exactamente como están en el proyecto, salvo verificación explícita:
- Florida 2-15
- Licencia G369134
- NPN 22325493

Mensaje de marca:
> Primero escucho, después propongo.

Idioma principal: español.

No inventar datos, carriers, beneficios, comisiones, primas, testimonios, direcciones, productos, rendimientos ni afiliaciones.

## Dirección visual

Objetivo: `fintech premium + lujo tecnológico sobrio + calidez humana`.

Base visual:
- azul marino profundo alrededor de `#0A192F`
- dorado premium alrededor de `#D4AF37`
- blanco cálido / grises suaves
- glassmorphism refinado
- profundidad leve
- microinteracciones suaves
- mucho espacio negativo
- jerarquía tipográfica editorial

Tipografías objetivo:
- titulares: Fraunces o equivalente editorial premium
- interfaz/cuerpo: Inter

Evitar:
- emojis como iconos principales
- clipart
- iconos de estilos mezclados
- exceso de brillo/glow
- efectos pesados
- partículas constantes
- animaciones que compitan con el contenido

## Iconografía

Unificar todo en un solo sistema SVG de trazos limpios y modernos para:
- Vida
- Salud
- Medicare
- Retiro
- WhatsApp
- Llamar
- Email
- Guardar contacto
- Compartir
- QR
- Calculadora
- Licencia verificada
- Cita

Los iconos deben verse modernos también a 24–32 px.

## Hero

Debe entenderse en 2–3 segundos.

Contenido propuesto:

Eyebrow:
`AGENTE LICENCIADO EN FLORIDA · ATENCIÓN EN ESPAÑOL`

H1:
`Primero escucho. Después propongo.`

Subtítulo:
`Vida, Salud, Medicare y Retiro explicados con claridad para que usted pueda tomar una decisión con confianza.`

CTA principal:
`REVISAR MIS OPCIONES`

CTA secundario:
`ESCRIBIR POR WHATSAPP`

Acciones discretas:
- Guardar contacto
- Compartir
- Mostrar QR

Indicadores de confianza:
- Atención en español
- Florida 2-15
- Atención virtual y presencial
- Orientación clara y sin presión

Integrar la foto `foto.jpg` de forma editorial; evitar que parezca una imagen simplemente pegada dentro de un círculo.

## Selector de necesidad

Después del hero, presentar:

`¿Qué le gustaría proteger?`

Opciones:
- Proteger a mi familia — Seguro de Vida
- Cuidar mi salud — Cobertura de Salud
- Entender mis opciones de Medicare — Medicare
- Preparar mi retiro — Retiro / Anualidades

La selección debe adaptar el contenido en la misma página con transición suave.

## WhatsApp contextual

Mantener el número real existente en el proyecto y generar mensajes diferentes por contexto.

Ejemplos:
- Vida: `Hola William. Vi su tarjeta digital y quisiera revisar opciones de seguro de vida.`
- Salud: `Hola William. Vi su tarjeta digital y quisiera información sobre mis opciones de cobertura de salud.`
- Medicare: `Hola William. Vi su tarjeta digital y quisiera orientación sobre Medicare.`
- Retiro: `Hola William. Vi su tarjeta digital y quisiera conversar sobre opciones para mi retiro.`

## Captación de prospectos

Agregar alternativa para quien no quiera iniciar WhatsApp de inmediato.

Formulario corto:
- nombre
- teléfono
- interés: Vida / Salud / Medicare / Retiro
- horario preferido: mañana / tarde
- método preferido: WhatsApp / llamada

No pedir en formulario abierto:
- SSN
- número de Medicare
- datos médicos sensibles
- documentos
- tarjetas/cuentas
- fecha de nacimiento completa

Si no existe un backend real para almacenar leads, **no inventarlo**. Construir el componente preparado para conectarse y documentar lo que falta.

## Tracking

Leer y conservar:
- `src`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

Preparar eventos sin inventar IDs de Analytics:
- `card_view`
- `cta_main_click`
- `service_selected`
- `whatsapp_click`
- `phone_click`
- `save_contact`
- `share_card`
- `qr_open`
- `calculator_start`
- `calculator_complete`
- `lead_form_open`
- `lead_form_submit`

## Calculadora DIME

La tarjeta actual ya tiene calculadora DIME. **No eliminarla**.

Conservar su función educativa, pero mejorar UX y presentación.

No aumentar sus claims comerciales.

Después del resultado mostrar CTA equivalente a:
`WILLIAM, QUIERO REVISAR ESTE RESULTADO`

El mensaje de WhatsApp puede incluir el resultado estimado, pero evitar incluir datos sensibles innecesarios.

## Guardar / compartir / QR

Implementar o mejorar:
- vCard real con datos existentes del proyecto
- Web Share API + fallback
- QR generado localmente, sin dependencia de servicio pago

## Performance y accesibilidad

Mobile-first.

Objetivos:
- LCP ideal < 2.5 s
- CLS mínimo
- Lighthouse Performance 90+
- Accessibility 95+
- áreas táctiles >= 44 px
- `prefers-reduced-motion`
- focus visible
- contraste AA
- labels/aria correctos
- sin scroll horizontal accidental

No introducir frameworks pesados si la implementación actual puede evolucionar con HTML/CSS/JS nativo.

## PWA / offline

La tarjeta ya tiene `app.webmanifest` y `sw.js`.

Preservar PWA/offline, actualizar nombres de cache cuando sea necesario para invalidar versiones viejas y asegurar que los nuevos activos críticos estén disponibles.

## Compliance

No afirmar afiliación con Medicare, CMS, HealthCare.gov ni gobierno.

No introducir:
- logos de carriers no confirmados
- precios
- primas
- tasas
- beneficios específicos
- rendimientos
- promesas de aprobación
- testimonios inventados

Conservar el carácter educativo del sitio cuando corresponda.

## Flujo de trabajo obligatorio

1. Auditar `tarjeta/index.html` antes de reescribir.
2. Identificar y conservar funciones útiles existentes.
3. Implementar en esta rama.
4. No publicar en `main`.
5. Probar en móvil y desktop.
6. Revisar consola, enlaces, WhatsApp, vCard, share, QR, calculadora, formularios y UTMs.
7. Hacer una segunda pasada crítica de UX/CRO.
8. Hacer una tercera pasada de polish visual/pixel-level.
9. Entregar un resumen de archivos modificados y pruebas realizadas.
10. Abrir PR hacia `main` solo cuando la versión esté lista para revisión de William; **no fusionar sin aprobación explícita**.

## Criterio de calidad

La nueva tarjeta debe sentirse claramente una generación por delante de la versión actual, pero mediante mejor diseño, UX, iconografía, conversión y ejecución — no por efectos gratuitos.

Resultado buscado:
> Una tarjeta digital de seguros diseñada como un producto tecnológico premium, pero que sigue sintiéndose humana.
