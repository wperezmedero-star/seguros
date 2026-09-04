const ALLOWED_ORIGINS = new Set([
  "https://williamperezseguros.com",
  "https://www.williamperezseguros.com",
  "https://wperezmedero-star.github.io",
]);

const SESSION_INSTRUCTIONS = `Eres la asistente virtual educativa de William Perez-Mederos para su sitio de seguros en Florida.

Habla en el idioma del visitante; usa español por defecto. Tu voz debe sentirse cálida, natural, tranquila y profesional. Responde de forma breve, clara y sin jerga. Haz una sola pregunta a la vez.

El sitio está en modo educativo. Explica conceptos generales de seguros de vida, salud, Medicare y anualidades, pero no cotices primas, no recomiendes un producto específico, no prometas cobertura o aprobación, no completes solicitudes y no afirmes representar a una aseguradora ni al gobierno. Cuando una pregunta requiera revisar elegibilidad, costos, cobertura o una póliza concreta, indica que William debe revisarla personalmente.

No solicites ni repitas números de Seguro Social, Medicare, cuentas bancarias, tarjetas, contraseñas ni detalles médicos sensibles. Si alguien comparte esos datos, pídele que deje de hacerlo. Para emergencias médicas o peligro inmediato, indica llamar al 911. Aclara que eres una asistente virtual y que la información es educativa, no asesoría legal, médica o financiera.`;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}

function jsonResponse(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.has(origin);

    if (request.method === "GET" && url.pathname === "/") {
      return jsonResponse(
        { ok: true, service: "William Seguros Voz", configured: Boolean(env.OPENAI_API_KEY) },
        200,
        { "Cache-Control": "no-store" },
      );
    }

    if (!allowedOrigin) {
      return jsonResponse({ error: "Origen no autorizado" }, 403);
    }

    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST" || url.pathname !== "/session") {
      return jsonResponse({ error: "Ruta no encontrada" }, 404, cors);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ error: "El servicio de voz todavía no está configurado" }, 503, cors);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().startsWith("application/sdp")) {
      return jsonResponse({ error: "Formato de conexión no válido" }, 415, cors);
    }

    const sdp = await request.text();
    if (!sdp || sdp.length > 50000) {
      return jsonResponse({ error: "Conexión vacía o demasiado grande" }, 400, cors);
    }

    const session = {
      type: "realtime",
      model: "gpt-realtime-2.1-mini",
      instructions: SESSION_INSTRUCTIONS,
      audio: { output: { voice: "marin" } },
    };

    const form = new FormData();
    form.set("sdp", sdp);
    form.set("session", JSON.stringify(session));

    try {
      const openaiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
        body: form,
      });

      const responseBody = await openaiResponse.text();
      if (!openaiResponse.ok) {
        console.error("OpenAI Realtime error", openaiResponse.status, responseBody);
        return jsonResponse({ error: "No se pudo iniciar la conversación de voz" }, 502, cors);
      }

      return new Response(responseBody, {
        status: 200,
        headers: { ...cors, "Content-Type": "application/sdp" },
      });
    } catch (error) {
      console.error("Realtime connection error", error);
      return jsonResponse({ error: "Servicio de voz temporalmente no disponible" }, 502, cors);
    }
  },
};
