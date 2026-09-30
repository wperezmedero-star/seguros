# Recuperación de transiciones — 30 septiembre 2026

William reportó pausas intermitentes entre temas, por ejemplo al salir de Sobre mí. Una transición real Sobre mí → Calculadoras terminó en Chromium; no se reprodujo el bloqueo persistente ni se confirmó una única causa en Safari.

Puntos débiles encontrados: la salida mantenía `saliendo` y una capa opaca sin límite si la siguiente página demoraba; la limpieza temporizada de entrada podía borrar el estilo de una nueva salida; los temporizadores/listeners de salida no se cancelaban al ocultar el documento.

Corrección: recuperar enlaces y retirar capa tras 1800 ms si el documento permanece; cancelar temporizadores y listener al salir/restaurar desde bfcache; ignorar animationend de elementos hijos; no bloquear navegación de movimiento reducido; retirar la cubierta de entrada después de 1300 ms desde el propio head aunque el JS externo tarde. Los callbacks de entrada solo actúan si aún existe rayo-cubre. Se mantienen los estilos de transición y el tratamiento de sesiones de voz.

Validación: `node review/navigation-recovery.test.cjs` pasa seis escenarios controlados: navegación demorada y nuevo intento; eventos de hijo; cancelación y regreso bfcache; entrada sin evento; entrada anterior con salida nueva; navegación repetida con movimiento reducido. `node --check assets/js/navegacion.js` y diff --check correctos. Falta verificación de la corrección publicada en Safari físico.

Para Astra: rama `transiciones-recuperacion-20260930`. Preparada para revisión; no publicarla automáticamente bajo la instrucción vigente. Esta nota no afirma que el caso intermitente original se haya reproducido o quedado demostrado como resuelto.
