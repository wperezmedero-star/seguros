# Logo WP — entrada v6 «Ensamblaje de precisión»
Fecha: 2026-10-01 · Estado: PENDIENTE de aprobación de William. No publicar en main sin su visto bueno.

## Qué cambia respecto a v5
- Piezas reales: el WP aprobado se separa en sus 5 trazos (V, diagonales, rombo, panza y fuste de la P) mediante segmentación del canal alfa. v5 usaba 3 cortes poligonales rectos que atravesaban las letras.
- Grosor 3D: cada pieza lleva canto dorado (capas de extrusión) y la escena gira de 3/4 a frente con perspectiva.
- Plano técnico: marcas de registro, eje central y guías numeradas 01–05 que se retiran antes del encaje.
- Encaje: destello, onda dorada, 18 chispas en las uniones, micro-golpe de escala y brillo especular enmascarado por la silueta del logo.
- Firma: «William Pérez Seguros» + «Protege a quienes dependen de ti».
- Salida: el logo vuela (FLIP) al logo del encabezado mientras la cortina se retira; si el encabezado no está visible, se desvanece con escala.

## Integridad del logo
- No se modifica wp-card-transparent-768.webp. Al encajar se muestra esa imagen original exacta.
- assets/brand/wp-piezas.webp (≈175 KB) es un atlas derivado de la misma imagen: 5 frentes con píxeles originales y 5 cantos oscurecidos para el grosor.

## Tiempos (desde que el atlas está decodificado)
Encaje 1.44 s · firma 1.48 s · vuelo 2.42 s · fin ≈ 3.2 s. La cascada del hero se reprograma en vivo para arrancar al levantarse la cortina. Cualquier toque, tecla, rueda o touch la salta (240 ms).

## Seguridad y respaldo
- Una vez por sesión (clave wps-brand-entrance-v6); no corre con reducir movimiento ni al llegar por transición interna.
- Si el atlas no carga en 1.4 s, se muestra el logo completo y se sale.
- Sin JS o sin Web Animations: logo completo y cortina CSS que se retira a 1.6 s. Retirada de seguridad de la clase a 5.2 s.
- pointer-events: none; no se tocan Ethos, formularios, asistente de voz, navegación ni tarjeta.

## Verificado
Chromium (Playwright) 1365×900 y 390×844: vídeo cuadro a cuadro sin cuadros vacíos en el encaje, vuelo al encabezado, salto en las 5 páginas, visita repetida, reducir movimiento, sin errores de consola, nodos temporales eliminados al terminar.
Límite: no probado en Safari de iPhone/iPad físico.
