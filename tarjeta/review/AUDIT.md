# Auditoría previa — tarjeta existente

Base: `8aab5870b5343cc4ec6157fee06ff77a66469ebb`, rama `card-v2-premium-lead-engine`.
Se leyeron completos `ASTRA6_HANDOFF.md`, `index.html`, `sw.js`, el manifest y el Worker de voz. La versión publicada se inspeccionó en navegador. No hay backend de prospectos; el Worker existente solo ofrece sesiones de voz y queda intacto.

| Bloque original | Decisión | Motivo |
| --- | --- | --- |
| Nombre, teléfono, email, licencia, NPN, dirección de vCard | Conservar | Datos del proyecto, sin suponer información nueva. |
| `foto.jpg`, imágenes de los ramos, icono | Conservar y optimizar | Misma fotografía y recursos; originales intactos. |
| Hero, lema, credenciales | Elevar | Foto editorial, mejor jerarquía, CTA antes del primer desplazamiento en móvil. |
| WhatsApp, llamada, correo, vCard, compartir | Conservar y elevar | Contexto por necesidad, codificación segura y alternativas accesibles. |
| Carrusel de seis áreas, incluyendo Accidentes y Asesoría | Conservar y elevar | Desplazamiento manual con controles; se retiran bucle y clones que dificultan lectura y teclado. |
| Aurora, inclinación táctil, parallax, barridos infinitos | Retirar | Movimiento innecesario, consumo continuo y competencia con el contenido. |
| Revelados y respuesta al toque | Elevar | Transiciones breves, sin esconder contenido cuando falla JavaScript; movimiento reducido. |
| DIME, cuatro campos, desglose y dictado | Conservar y elevar | Misma fórmula: D + I×10 + H + N×40.000 + 15.000; supuestos visibles, validación y WhatsApp con solo el total. |
| Cómo trabajo y aviso informativo | Conservar y elevar | Misma propuesta humana; ninguna aseguradora, prima o afiliación añadida. |
| QR fijo incrustado | Reemplazar | Generación local verificable, margen blanco, descarga, parámetros de campaña. |
| PWA y offline | Conservar y corregir | Caché acotada a la tarjeta; no borrar cachés de otras apps ni cachear solicitudes personales. |
| Escritura NFC con `#nfc` | Conservar y corregir | Acción explícita del usuario; evita intentar escribir sin gesto o permiso. |
| Prospectos / tracking | Agregar | Solicitud preparada para enviar por correo, sin afirmar recepción; eventos sin datos personales ni ID inventado. |

No se verificó externamente el estado de la licencia: se conservan los identificadores suministrados, con acceso a la consulta oficial. No se añaden afirmaciones de licencia «verificada» por esta intervención.
