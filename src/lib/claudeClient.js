import Anthropic from '@anthropic-ai/sdk'
import { PIECE_DIMENSIONS } from '../constants/spec'

function prepareImage(file) {
  const MAX_DIM = 1500
  const JPEG_QUALITY = 0.85

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')) }

    img.onload = () => {
      URL.revokeObjectURL(url)
      const longestSide = Math.max(img.width, img.height)

      if (longestSide <= MAX_DIM) {
        const reader = new FileReader()
        reader.onload = () => resolve({ base64: reader.result.split(',')[1], mediaType: file.type || 'image/png' })
        reader.onerror = reject
        reader.readAsDataURL(file)
        return
      }

      const ratio = MAX_DIM / longestSide
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve({ base64: canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1], mediaType: 'image/jpeg' })
    }

    img.src = url
  })
}

export async function generateDesign({ image, piece, product }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Falta la API key. Configurá VITE_ANTHROPIC_API_KEY en el archivo .env')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const { base64, mediaType } = await prepareImage(image)

  const productLabel =
    product === 'LN' ? 'LA NACION' : product === 'CLN' ? 'Club LA NACION' : 'Foodit'

  const isBgPiece = piece === 'Paywall' || piece === 'Modal V3'

  const dims = PIECE_DIMENSIONS[piece] || []
  const breakpointList = dims
    .map((d) => `  - ${d.bp}: ${d.w}×${d.h}px — ratio ${d.ratio} — ${d.note}`)
    .join('\n')

  const modalObjective = piece === 'Modal V1'
    ? 'Modal V1 — Beneficio Económico: la imagen acompaña al precio/oferta sin competirle. Transmite valor, producto o situación relacionada con el beneficio económico. No debe distraer del precio.'
    : 'Modal V2 — Conexión Emocional: la imagen ES el vehículo narrativo principal. Ocupa prácticamente todo el modal. Debe generar identificación emocional y transmitir pertenencia o aspiración.'

  const prompt = isBgPiece
    ? buildBgPrompt({ productLabel, piece, breakpointList, product })
    : buildModalImagePrompt({ productLabel, piece, breakpointList, dims, modalObjective })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })

  let text = response.content[0].text.trim()
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    console.error('[claudeClient] Sin JSON en la respuesta:', text.slice(0, 300))
    throw new Error('La respuesta del modelo no contiene JSON. Intentá de nuevo.')
  }

  const jsonStr = text.slice(start, end + 1)

  try {
    return JSON.parse(jsonStr)
  } catch (parseErr) {
    console.error('[claudeClient] Error al parsear JSON:', parseErr.message)
    console.error('[claudeClient] Primeros 500 chars:', jsonStr.slice(0, 500))
    console.error('[claudeClient] Últimos 200 chars:', jsonStr.slice(-200))
    throw new Error(`JSON malformado: ${parseErr.message}. Si el error persiste, intentá con una imagen más pequeña.`)
  }
}

// ─── Prompt para piezas de fondo (Paywall, Modal V3) ──────────────────────────

function buildBgPrompt({ productLabel, piece, breakpointList, product }) {
  const brandColors = {
    LN: '#073945 / #0A3D4A / #0B4A5C (azul petróleo muy oscuro)',
    CLN: '#1553A0 / #1757A8 / #1A5BBF (azul medio-oscuro saturado)',
    Foodit: '#3A4A18 / #404C1A / #2E3A10 (verde oliva oscuro)',
  }

  return `Sos un director de arte senior del ecosistema de conversión de ${productLabel}.

PRODUCTO: ${productLabel}
PIEZA: ${piece} — fondo decorativo

BREAKPOINTS A GENERAR (uno por breakpoint):
${breakpointList}

══════════════════════════════════════════════
LÓGICA COMPOSITIVA DEL BANNER
══════════════════════════════════════════════

El diseño de banner sigue esta estructura de DOS NIVELES:

NIVEL 1 — ASSETS PRINCIPALES (bordes izquierdo y derecho):
- Elementos más grandes y con más peso visual del KV
- Ubicados en los BORDES del canvas: izquierdo y derecho, sangrados parcialmente
- Ocupan aproximadamente el 20-25% de cada lado
- Opacidad: 40%

NIVEL 2 — ELEMENTO DECORATIVO (disperso):
- UN SOLO elemento pequeño del KV como acento decorativo
- Se repite 3 a 5 veces en posiciones y rotaciones distintas, fuera del área central
- Opacidad: 15-25%

ZONA CENTRAL: el 50-60% central completamente limpio para texto y CTAs.

══════════════════════════════════════════════
PASO 1 — EXTRACCIÓN DE COLORES (HEX EXACTOS)
══════════════════════════════════════════════

Identificá colores con hex exacto de la imagen.

⚠️ REGLA CRÍTICA — COLOR DE FONDO:
NUNCA blanco ni colores claros. Los fondos son SIEMPRE oscuros y saturados.
Referencia de marca para ${productLabel}: ${brandColors[product] || brandColors.LN}

Si el fondo del KV es blanco/transparente → ignorarlo completamente.
Derivá el color de los assets del KV + referencia de marca del producto.

══════════════════════════════════════════════
PASO 2 — ANÁLISIS DE ASSETS
══════════════════════════════════════════════

Identificá exactamente:
- 1 asset principal IZQUIERDO: el elemento más grande y con más peso visual
- 1 asset principal DERECHO: segundo elemento de peso (puede ser similar o complementario)
- 1 elemento DECORATIVO: el más simple para repetir como acento disperso

Para cada uno: nombre exacto, forma, colores hex, estilo de renderizado.
TOTAL: exactamente 3 elementos.

══════════════════════════════════════════════
PASO 3 — CONSTRUCCIÓN DE PROMPTS EN ESPAÑOL
══════════════════════════════════════════════

⚠️ TODOS los prompts en ESPAÑOL.
El diseñador adjuntará las imágenes del KV en ChatGPT — el prompt NO describe los elementos, solo da instrucciones técnicas y compositivas.

Primer breakpoint = REFERENCIA (prompt completo).
Siguientes = ADAPTACIONES (replicar composición, adaptar dimensiones).
Excepción Paywall Mobile: solo color sólido, sin elementos.

PROMPT DE REFERENCIA:
"Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente [W]×[H] píxeles, orientación horizontal apaisada, para usar como fondo decorativo de una página web de suscripción. Color de fondo sólido [HEX], accesible para usar con tipografía blanca, completamente plano. Elementos decorativos distribuidos con dispersión orgánica, no alineados en cuadrícula, algunos levemente rotados. Sin texto, sin palabras, sin letras, sin números, sin personas, sin rostros, sin fotografía ni fotorrealismo. Fondo limpio y sutil para una página de suscripción.
Usá las imágenes adjuntas como estilo visual. La imagen debe ser: [W] px × [H] px"

PROMPTS DE ADAPTACIÓN:
"Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente [W]×[H] píxeles replicando la misma composición y estilo visual del fondo de referencia ([W_REF]×[H_REF] px), adaptada a estas nuevas dimensiones. Mismo color de fondo sólido [HEX], mismos elementos decorativos con dispersión orgánica ajustada al nuevo ancho. Sin texto, sin palabras, sin letras, sin números, sin personas, sin rostros, sin fotografía ni fotorrealismo. Fondo limpio y sutil para una página de suscripción.
Usá las imágenes adjuntas como estilo visual. La imagen debe ser: [W] px × [H] px"

PROMPT MOBILE (solo Paywall — sin elementos):
"Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente [W]×[H] píxeles para usar como fondo de una página web de suscripción. Color de fondo sólido [HEX], completamente plano, sin ningún elemento decorativo. La imagen debe ser: [W] px × [H] px"

REGLA: el [HEX] siempre derivado del KV + marca. NUNCA blanco ni claro. Mismo HEX en todos los breakpoints.

══════════════════════════════════════════════
FORMATO DE RESPUESTA — SOLO JSON, SIN MARKDOWN
══════════════════════════════════════════════

Respondé ÚNICAMENTE con el JSON. Sin texto antes ni después. Sin bloques de código.

{
  "summary": "descripción en una oración de la propuesta compositiva",

  "kv_analysis": {
    "palette": [
      { "role": "Fondo del banner (derivado de assets)", "hex": "#001E62", "description": "azul marino oscuro derivado del tono más oscuro de los assets — el KV tenía fondo blanco que se ignoró" },
      { "role": "Asset principal", "hex": "#002060", "description": "color dominante del elemento principal" }
    ],
    "illustration_style": "ilustración 3D de tarjetas apiladas con efecto de profundidad y degradé azul",
    "resources": [
      { "element": "stack de tarjetas apiladas en abanico — asset principal izquierdo", "category": "Principal" },
      { "element": "stack de tarjetas apiladas en abanico — asset principal derecho", "category": "Principal" },
      { "element": "forma de estrella dentada (único acento decorativo)", "category": "Decorativo" }
    ],
    "tone": "tecnológico, premium, dinámico",
    "restrictions": ["logotipo LN: no reproducir literalmente"]
  },

  "miscelaneas": {
    "kv_global_style": "elementos 3D de tarjetas apiladas con degradé azul marino a azul claro, con íconos planos geométricos dispersos",
    "left": {
      "name": "stack de tarjetas apiladas en abanico — izquierda",
      "object_description": "múltiples tarjetas rectangulares con esquinas redondeadas superpuestas en abanico",
      "visual_details": "8-10 tarjetas offset entre sí hacia atrás y a la derecha, efecto de profundidad",
      "rendering": "ilustración 3D, estilo flat con profundidad, gradiente de #002060 a #1A56DB",
      "colors": "#002060, #1A56DB, #4DA6FF",
      "scale_and_placement": "grande, sangrado por el borde izquierdo e inferior del canvas"
    },
    "right": {
      "name": "stack de tarjetas apiladas en abanico — derecha",
      "object_description": "similar al izquierdo pero en tonos más claros y orientado hacia la derecha",
      "visual_details": "misma estructura de apilamiento, gradiente diferente o complementario",
      "rendering": "ilustración 3D, gradiente de #1A56DB a #4DA6FF",
      "colors": "#1A56DB, #3D8EF0, #4DA6FF",
      "scale_and_placement": "grande, sangrado por el borde derecho e inferior del canvas"
    },
    "scattered": [
      {
        "name": "estrella dentada / starburst",
        "description": "forma de estrella con múltiples puntas cortas tipo sello radiante. Se repite 3-4 veces en distintas posiciones y rotaciones.",
        "rendering": "silueta plana, relleno sólido",
        "colors": "#A8C4F0",
        "size": "muy pequeño (24-48px)"
      }
    ]
  },

  "proposal": {
    "background": {
      "type": "solid",
      "value": "#001E62",
      "description": "azul marino oscuro derivado del tono más oscuro de los assets del KV (fondo blanco del KV ignorado)"
    },
    "assets": [
      { "name": "cards-stack-left.png", "frame": "izquierdo", "format": "PNG", "description": "stack de tarjetas, borde izquierdo" },
      { "name": "cards-stack-right.png", "frame": "derecho", "format": "PNG", "description": "stack de tarjetas, borde derecho" }
    ],
    "distribution": "Bordes: stacks de cards en izquierda y derecha, sangrados. Centro 60% limpio."
  },

  "tech_spec": {
    "dimensions_used": "según breakpoints listados",
    "safe_areas": "navbar 80px superior reservado, área central de contenido sin obstruir",
    "checklist": {
      "max_2_assets": true,
      "bg_by_code": true,
      "mobile_no_images": true,
      "content_not_invaded": true,
      "wcag_estimated": true,
      "touch_target": true
    }
  },

  "designer_note": "Para usar estos prompts en ChatGPT: copiá el texto del prompt y adjuntá también las imágenes de los assets del KV en la misma conversación. ChatGPT usará las imágenes como referencia visual.",

  "prompts": [
    {
      "breakpoint": "Desktop 1920",
      "key": "d1920",
      "dimensions": "1920×420px",
      "type": "bg",
      "note": "Breakpoint de referencia — prompt completo",
      "prompt": "Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente 1920×420 píxeles, orientación horizontal apaisada, para usar como fondo decorativo de una página web de suscripción. Color de fondo sólido #001E62, accesible para usar con tipografía blanca, completamente plano. Elementos decorativos distribuidos con dispersión orgánica, no alineados en cuadrícula, algunos levemente rotados. Sin texto, sin palabras, sin letras, sin números, sin personas, sin rostros, sin fotografía ni fotorrealismo. Fondo limpio y sutil para una página de suscripción.\\nUsá las imágenes adjuntas como estilo visual. La imagen debe ser: 1920 px × 420 px"
    },
    {
      "breakpoint": "Mobile",
      "key": "mobile",
      "dimensions": "360×372px",
      "type": "bg",
      "note": "Solo color de fondo — sin elementos decorativos",
      "prompt": "Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente 360×372 píxeles para usar como fondo de una página web de suscripción. Color de fondo sólido #001E62, completamente plano, sin ningún elemento decorativo. La imagen debe ser: 360 px × 372 px"
    }
  ]
}`
}

// ─── Prompt para piezas de imagen editorial (Modal V1, Modal V2) ──────────────

function buildModalImagePrompt({ productLabel, piece, breakpointList, dims, modalObjective }) {
  const refDim = dims[0] || {}
  const refLabel = `${refDim.w}×${refDim.h}px`

  return `Sos un director de arte senior del ecosistema de conversión de ${productLabel}.

PRODUCTO: ${productLabel}
PIEZA: ${piece} — imagen editorial para modal

BREAKPOINTS A GENERAR (uno por breakpoint):
${breakpointList}

══════════════════════════════════════════════
TIPO DE PIEZA: IMAGEN EDITORIAL PARA MODAL
══════════════════════════════════════════════

Esta pieza NO es un fondo decorativo. Es una imagen fotográfica o ilustrada de alta calidad que ocupa un área específica del modal de suscripción.

NO aplica la lógica de banner (sin bordes izquierdo/derecho con assets sangrados, sin zona central vacía, sin elementos al 40% de opacidad). La imagen ocupa TODO su frame con composición editorial completa.

OBJETIVO DE ESTA VARIANTE:
${modalObjective}

══════════════════════════════════════════════
PASO 1 — ANÁLISIS CROMÁTICO DEL KV
══════════════════════════════════════════════

Extraé los colores principales del KV con hex exactos. Estos servirán como paleta de referencia para la imagen del modal.
Identificá: colores dominantes, secundarios, tono emocional que transmite la paleta.

══════════════════════════════════════════════
PASO 2 — EXTRACCIÓN DEL CONTENIDO EDITORIAL
══════════════════════════════════════════════

Analizá el KV para identificar el material visual que puede protagonizar la imagen del modal:
- ¿Hay fotografías de personas, escenas, ambientes o situaciones?
- ¿Hay ilustraciones, personajes o elementos narrativos fuertes?
- ¿Cuál es el mood o atmósfera general del KV?
- ¿Qué elemento visual tiene más potencia emotiva o narrativa?
- ¿Qué concepto o escena sintetiza mejor la propuesta de la campaña?

Elegí el concepto editorial más potente para la imagen del modal.
Describí: sujeto/escena principal, atmósfera, estilo visual (fotográfico / ilustrado / editorial), paleta emocional.

Considerá los ratios de cada breakpoint al pensar la composición:
${dims.map(d => `  - ${d.bp}: ratio ${d.ratio} — ${d.note}`).join('\n')}

══════════════════════════════════════════════
PASO 3 — CONSTRUCCIÓN DE PROMPTS EN ESPAÑOL
══════════════════════════════════════════════

⚠️ TODOS los prompts en ESPAÑOL.
El diseñador adjuntará las imágenes del KV directamente en ChatGPT. La IA usa esas imágenes como referencia de estilo y contenido. El prompt NO describe en detalle los elementos visuales — eso lo hacen las imágenes adjuntas.

Primer breakpoint = REFERENCIA (${refLabel}) → prompt completo con UNA oración de concepto.
Siguientes breakpoints = ADAPTACIONES → mismo mood y sujeto, reencuadrado para el nuevo ratio.

Cuando el ratio cambia significativamente entre breakpoints (ej: de 9:16 vertical a 5:2 panorámico), el reencuadre puede ser sustancial — mantener mood y paleta, adaptar la composición al nuevo formato.

PROMPT DE REFERENCIA (${refLabel}):
"Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente [W]×[H] píxeles para usar en un modal de suscripción. [UNA oración concisa sobre el concepto, mood o sujeto derivado del KV — ej: "Imagen que transmite pertenencia y bienestar, con sujeto en primer plano en un ambiente cálido."]. Composición [ORIENTACIÓN según ratio: vertical para 9:16 · panorámica para 5:2 · horizontal para 16:9 · cuadrada/retrato para 4:5 y 3:4]. Sin texto, sin palabras, sin letras, sin números, sin marcas de agua.
Usá las imágenes adjuntas como referencia visual y de estilo. La imagen debe ser: [W] px × [H] px"

PROMPTS DE ADAPTACIÓN (breakpoints siguientes):
"Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente [W]×[H] píxeles replicando el mood y el concepto visual del modal de referencia (${refLabel}), adaptada al ratio [RATIO]. Mismo estilo visual, misma paleta, mismo sujeto — reencuadrado para el nuevo formato. Sin texto, sin palabras, sin letras, sin números, sin marcas de agua.
Usá las imágenes adjuntas como referencia visual y de estilo. La imagen debe ser: [W] px × [H] px"

══════════════════════════════════════════════
FORMATO DE RESPUESTA — SOLO JSON, SIN MARKDOWN
══════════════════════════════════════════════

Respondé ÚNICAMENTE con el JSON. Sin texto antes ni después. Sin bloques de código.

{
  "summary": "descripción en una oración del concepto editorial propuesto para el modal",

  "kv_analysis": {
    "palette": [
      { "role": "Color dominante del KV", "hex": "#2C4A7C", "description": "azul profundo que domina la escena" },
      { "role": "Color de acento", "hex": "#F5A623", "description": "naranja cálido de elementos secundarios" }
    ],
    "illustration_style": "fotografía editorial con personas en ambientes urbanos cálidos, luz natural",
    "resources": [
      { "element": "fotografía de persona en ambiente cálido — protagonista principal", "category": "Principal" },
      { "element": "elemento gráfico o textural de apoyo del KV", "category": "Secundario" }
    ],
    "tone": "aspiracional, cálido, de pertenencia",
    "restrictions": ["no reproducir personas reales reconocibles del KV si son figuras públicas"]
  },

  "modal_concept": {
    "mood": "calidez y pertenencia, espacio íntimo, luz natural, sensación de bienestar",
    "main_subject": "persona joven en un ambiente doméstico cálido disfrutando de contenido — protagonista en primer plano",
    "editorial_style": "fotografía editorial con luz natural, paleta cálida, estilo lifestyle moderno",
    "composition_notes": "para ratio 9:16 (Desktop): composición vertical, sujeto centrado con espacio superior. Para ratio 5:2 (Tablet): escena panorámica, sujeto a un tercio con contexto. Para ratio 16:9 (Mobile): encuadre cinemático horizontal."
  },

  "tech_spec": {
    "dimensions_used": "según breakpoints listados",
    "safe_areas": "la imagen ocupa su frame completo — el modal ubica el contenido (título, precio, CTA) superpuesto o en área adyacente según la variante",
    "checklist": {
      "max_2_assets": null,
      "bg_by_code": null,
      "mobile_no_images": null,
      "content_not_invaded": true,
      "wcag_estimated": true,
      "touch_target": true
    }
  },

  "designer_note": "Para usar estos prompts en ChatGPT: copiá el texto del prompt y adjuntá también las imágenes del KV en la misma conversación. ChatGPT usará las imágenes como referencia visual y de estilo.",

  "prompts": [
    {
      "breakpoint": "Desktop",
      "key": "desktop",
      "dimensions": "${refLabel}",
      "type": "image",
      "note": "Breakpoint de referencia — prompt completo",
      "prompt": "Teniendo en cuenta las imágenes que te adjunto, generá una imagen de exactamente ${refDim.w}×${refDim.h} píxeles para usar en un modal de suscripción. [UNA oración de concepto derivada del KV]. Composición vertical, ratio ${refDim.ratio}, sujeto prominente. Sin texto, sin palabras, sin letras, sin números, sin marcas de agua.\\nUsá las imágenes adjuntas como referencia visual y de estilo. La imagen debe ser: ${refDim.w} px × ${refDim.h} px"
    }
  ]
}`
}
