const BOT_TREE = {
  "schema_version": "1.0",
  "name": "Asistente de Protección Familiar",
  "locale": "es-US",
  "purpose": "Orientar, educar, recopilar preferencias mínimas y facilitar una cita con un agente humano autorizado.",
  "prohibited_actions": [
    "cotizar sin datos oficiales de una aseguradora",
    "prometer aprobación, cobertura, ahorro, rendimiento o ingreso",
    "recomendar un producto específico sin revisión humana y documentación aplicable",
    "interpretar síntomas, diagnosticar o dar consejo médico",
    "solicitar números de Seguro Social, Medicare, tarjeta, cuenta bancaria o historia clínica detallada",
    "usar edad, salud, discapacidad o cualquier característica protegida para degradar la atención o priorizar comercialmente a una persona",
    "presentarse como una aseguradora o como Medicare, CMS, HealthCare.gov o una agencia gubernamental"
  ],
  "system_prompt": "Eres el asistente virtual de William Pérez-Mederos, una agencia o agente independiente de seguros en Florida. Hablas en español claro, cálido y profesional. Tu función es educativa: ayudas a la persona a identificar si desea conversar sobre seguro de vida, cobertura de salud/Medicare o planificación de retiro/anualidades. Nunca afirmes que una persona califica, está aprobada o recibirá un beneficio, rendimiento o ingreso específico. Nunca recomiendes una compañía o producto. Cuando falten datos, dilo. Pide solo información mínima y no sensible. El estado general de salud es opcional y solo sirve para preparar una conversación; jamás modifica el nivel de atención ni la puntuación del lead. Si la persona menciona una urgencia médica, indícale que llame al 911 o busque atención médica inmediata; no continúes vendiendo. Si la persona parece elegible para Medicare —normalmente por edad cercana a 65, por discapacidad, ESRD o ALS— ofrece derivarla a un agente debidamente certificado y no describas planes específicos sin materiales aprobados. Antes de recopilar teléfono o email, solicita consentimiento para contacto. Cierra cada explicación con una invitación sencilla, nunca con presión.",
  "style": {
    "voice": ["empática", "profesional", "directa", "sin presión"],
    "reading_level": "español sencillo",
    "max_sentences_per_message": 3,
    "avoid": ["jerga innecesaria", "miedo", "urgencia artificial", "superlativos no demostrables", "garantizado salvo lenguaje contractual aprobado"]
  },
  "lead_scoring": {
    "note": "La puntuación mide intención y disponibilidad para hablar, no asegurabilidad ni valor humano.",
    "hot_threshold": 6,
    "warm_threshold": 3,
    "rules": [
      {"field": "timeline", "equals": "0-30-dias", "points": 3},
      {"field": "timeline", "equals": "1-3-meses", "points": 2},
      {"field": "budget_status", "equals": "rango-definido", "points": 2},
      {"field": "budget_status", "equals": "necesito-orientacion", "points": 1},
      {"field": "appointment_interest", "equals": true, "points": 2},
      {"field": "contact_consent", "equals": true, "points": 1}
    ],
    "excluded_fields": ["age", "health_status", "disability", "diagnosis", "medicare_status"]
  },
  "global_interrupts": [
    {
      "id": "medical_emergency",
      "match": ["dolor de pecho", "no puedo respirar", "emergencia", "suicidio", "me quiero hacer daño", "derrame", "stroke"],
      "response": "Esto puede requerir atención inmediata. Llama al 911 o acude al servicio de emergencias ahora. No uses este chat para esperar una evaluación médica.",
      "end_conversation": true
    },
    {
      "id": "sensitive_data",
      "match": ["social security", "seguro social", "número de medicare", "tarjeta de crédito", "cuenta bancaria"],
      "response": "Por tu seguridad, no envíes números de Seguro Social, Medicare, tarjetas ni cuentas bancarias por este chat. Un agente te indicará un canal seguro si esa información llegara a ser necesaria.",
      "end_conversation": false
    }
  ],
  "start_node": "welcome",
  "nodes": [
    {
      "id": "welcome",
      "type": "message",
      "text": "¡Bienvenido! Puedo ayudarte a ordenar tus prioridades y, si lo deseas, conectarte con un agente autorizado. Esta orientación es educativa y no constituye una cotización ni una promesa de cobertura.",
      "next": "primary_goal"
    },
    {
      "id": "primary_goal",
      "type": "single_choice",
      "field": "primary_goal",
      "question": "¿Qué quieres proteger o planificar primero?",
      "options": [
        {"label": "Proteger a mi familia", "value": "vida", "next": "life_need"},
        {"label": "Cobertura médica", "value": "salud", "next": "health_coverage"},
        {"label": "Ingreso para el retiro", "value": "retiro", "next": "retirement_timing"},
        {"label": "No estoy seguro", "value": "orientacion", "next": "age_range"}
      ]
    },
    {
      "id": "life_need",
      "type": "multi_choice",
      "field": "life_need",
      "question": "¿Qué responsabilidades deseas que queden protegidas?",
      "options": [
        {"label": "Reemplazo de ingresos", "value": "ingresos"},
        {"label": "Hipoteca o deudas", "value": "deudas"},
        {"label": "Educación de hijos", "value": "educacion"},
        {"label": "Gastos finales", "value": "finales"},
        {"label": "Todavía no lo sé", "value": "no-se"}
      ],
      "next": "age_range"
    },
    {
      "id": "health_coverage",
      "type": "single_choice",
      "field": "health_coverage",
      "question": "¿Cuál describe mejor tu situación actual?",
      "options": [
        {"label": "No tengo cobertura", "value": "sin-cobertura", "next": "age_range"},
        {"label": "Quiero comparar mi cobertura", "value": "comparar", "next": "age_range"},
        {"label": "Estoy por cumplir 65", "value": "cerca-65", "next": "medicare_handoff"},
        {"label": "Ya tengo Medicare", "value": "tiene-medicare", "next": "medicare_handoff"},
        {"label": "Medicare por discapacidad/ESRD/ALS", "value": "medicare-temprano", "next": "medicare_handoff"}
      ]
    },
    {
      "id": "retirement_timing",
      "type": "single_choice",
      "field": "retirement_timing",
      "question": "¿Cuándo esperas comenzar a usar ese ingreso?",
      "options": [
        {"label": "En menos de 5 años", "value": "menos-5", "next": "age_range"},
        {"label": "Entre 5 y 10 años", "value": "5-10", "next": "age_range"},
        {"label": "En más de 10 años", "value": "mas-10", "next": "age_range"},
        {"label": "Ya estoy retirado", "value": "retirado", "next": "age_range"}
      ]
    },
    {
      "id": "medicare_handoff",
      "type": "message",
      "text": "Medicare tiene reglas de elegibilidad y períodos de inscripción específicos. Te conviene hablar con un agente debidamente certificado que revise tu fecha, cobertura actual y área de servicio sin asumir que un plan específico es adecuado.",
      "tags": ["medicare-specialist-required"],
      "next": "age_range"
    },
    {
      "id": "age_range",
      "type": "single_choice",
      "field": "age",
      "question": "¿En qué rango de edad estás?",
      "options": [
        {"label": "18–34", "value": "18-34", "next": "budget"},
        {"label": "35–49", "value": "35-49", "next": "budget"},
        {"label": "50–63", "value": "50-63", "next": "budget"},
        {"label": "64", "value": "64", "next": "medicare_age_notice"},
        {"label": "65 o más", "value": "65-plus", "next": "medicare_age_notice"}
      ]
    },
    {
      "id": "medicare_age_notice",
      "type": "conditional_message",
      "condition": "primary_goal == 'salud' || primary_goal == 'orientacion'",
      "if_true": {
        "text": "Por tu edad, incluiré una revisión de elegibilidad y períodos de Medicare con un agente certificado. Tener 65 años o más no significa automáticamente que cualquier plan sea adecuado.",
        "add_tags": ["medicare-specialist-required"]
      },
      "if_false": {"text": "Gracias. La edad ayuda a preparar la conversación, pero no determina la prioridad de atención."},
      "next": "budget"
    },
    {
      "id": "budget",
      "type": "single_choice",
      "field": "budget_status",
      "question": "Para una solución que puedas mantener, ¿cómo prefieres hablar del presupuesto mensual?",
      "options": [
        {"label": "Menos de $100", "value": "rango-definido", "metadata": {"budget_range": "0-99"}, "next": "health_status"},
        {"label": "$100–$249", "value": "rango-definido", "metadata": {"budget_range": "100-249"}, "next": "health_status"},
        {"label": "$250–$499", "value": "rango-definido", "metadata": {"budget_range": "250-499"}, "next": "health_status"},
        {"label": "$500 o más", "value": "rango-definido", "metadata": {"budget_range": "500-plus"}, "next": "health_status"},
        {"label": "Necesito orientación", "value": "necesito-orientacion", "next": "health_status"},
        {"label": "Prefiero no responder", "value": "no-responde", "next": "health_status"}
      ]
    },
    {
      "id": "health_status",
      "type": "single_choice_optional",
      "field": "health_status",
      "question": "Opcional: para que el agente prepare la conversación, ¿cómo describirías tu salud en términos generales? No incluyas diagnósticos ni medicamentos.",
      "options": [
        {"label": "Sin condiciones importantes", "value": "generalmente-bien", "next": "timeline"},
        {"label": "Tengo condiciones controladas", "value": "condiciones-controladas", "next": "timeline"},
        {"label": "Tengo una situación compleja", "value": "situacion-compleja", "next": "timeline"},
        {"label": "Prefiero hablarlo con el agente", "value": "privado", "next": "timeline"},
        {"label": "Omitir", "value": "omitido", "next": "timeline"}
      ],
      "does_not_affect_lead_score": true
    },
    {
      "id": "timeline",
      "type": "single_choice",
      "field": "timeline",
      "question": "¿Cuándo te gustaría revisar opciones?",
      "options": [
        {"label": "En los próximos 30 días", "value": "0-30-dias", "next": "appointment"},
        {"label": "En 1–3 meses", "value": "1-3-meses", "next": "appointment"},
        {"label": "Más adelante", "value": "mas-3-meses", "next": "appointment"},
        {"label": "Solo estoy aprendiendo", "value": "educacion", "next": "appointment"}
      ]
    },
    {
      "id": "appointment",
      "type": "yes_no",
      "field": "appointment_interest",
      "question": "¿Quieres una conversación breve y sin obligación con un agente autorizado?",
      "yes_next": "contact_consent",
      "no_next": "educational_close"
    },
    {
      "id": "contact_consent",
      "type": "consent",
      "field": "contact_consent",
      "text": "Autorizo a William Pérez-Mederos a contactarme por el medio que elija para responder mi solicitud. Entiendo que mi consentimiento no es condición para comprar y que pueden aplicar tarifas de mensajes y datos.",
      "accept_next": "contact_method",
      "decline_next": "educational_close"
    },
    {
      "id": "contact_method",
      "type": "contact_capture",
      "fields": ["first_name", "preferred_channel", "phone_or_email", "preferred_time", "timezone"],
      "validation": "email o teléfono válido; nunca solicitar datos financieros, médicos o identificadores gubernamentales",
      "next": "lead_result"
    },
    {
      "id": "lead_result",
      "type": "score_and_route",
      "routes": [
        {"condition": "tags contains 'medicare-specialist-required'", "destination": "medicare-certified-agent-queue"},
        {"condition": "score >= 6", "destination": "priority-human-calendar"},
        {"condition": "score >= 3", "destination": "standard-human-calendar"},
        {"condition": "score < 3", "destination": "education-nurture"}
      ],
      "response": "Gracias. Preparé un resumen de tus prioridades —sin determinar elegibilidad— para que el agente aproveche mejor la conversación. Elige el horario que te resulte más cómodo."
    },
    {
      "id": "educational_close",
      "type": "message",
      "text": "Perfecto. Puedes explorar las guías y calculadoras educativas sin compartir datos personales. Cuando quieras, aquí estaremos para ayudarte sin presión.",
      "end_conversation": true
    }
  ],
  "human_handoff_payload": {
    "include": [
      "primary_goal",
      "life_need",
      "health_coverage",
      "retirement_timing",
      "age",
      "budget_range",
      "health_status",
      "timeline",
      "preferred_channel",
      "preferred_time",
      "tags",
      "score",
      "contact_consent_timestamp"
    ],
    "exclude": ["diagnoses", "medications", "SSN", "Medicare_number", "financial_account_data"],
    "retention_note": "Definir y publicar un período de retención; eliminar leads inactivos conforme a la política de privacidad y obligaciones aplicables."
  }
};
