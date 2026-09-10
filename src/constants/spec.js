export const PRODUCTS = [
  { value: 'LN', label: 'LA NACION' },
  { value: 'CLN', label: 'Club LA NACION' },
  { value: 'Foodit', label: 'Foodit' },
]

export const PIECES = [
  { value: 'Paywall', label: 'Paywall — Landing de suscripción', color: 'bg-blue-600' },
  { value: 'Modal V1', label: 'Modal V1 — Beneficio Económico', color: 'bg-green-600' },
  { value: 'Modal V2', label: 'Modal V2 — Conexión Emocional', color: 'bg-purple-600' },
  { value: 'Modal V3', label: 'Modal V3 — No te vayas', color: 'bg-orange-500' },
]

// type: 'bg' = fondo abstracto/degradé (Paywall y V3)
//        'image' = imagen fotográfica/ilustrada (V1 y V2)
export const PIECE_DIMENSIONS = {
  Paywall: [
    { bp: 'Desktop 1920', key: 'd1920', w: 1920, h: 420, type: 'bg', ratio: '4.6:1', note: 'Fondo color/degradé + misceláneas del KV' },
    { bp: 'Desktop 1366', key: 'd1366', w: 1366, h: 420, type: 'bg', ratio: '3.25:1', note: 'Fondo color/degradé + misceláneas del KV' },
    { bp: 'Desktop 1280', key: 'd1280', w: 1280, h: 420, type: 'bg', ratio: '3:1',  note: 'Fondo color/degradé + misceláneas del KV' },
    { bp: 'Tablet 1279', key: 'tablet', w: 1279, h: 356, type: 'bg', ratio: '3.6:1', note: 'Fondo color/degradé + misceláneas del KV' },
    { bp: 'Mobile',       key: 'mobile', w: 360,  h: 372, type: 'bg', ratio: '1:1',  note: 'Fondo color/degradé + misceláneas del KV' },
  ],
  'Modal V1': [
    { bp: 'Desktop', key: 'desktop', w: 282, h: 500, type: 'image', ratio: '9:16', note: 'Imagen lateral izquierda' },
    { bp: 'Tablet',  key: 'tablet',  w: 472, h: 189, type: 'image', ratio: '5:2',  note: 'Imagen superior' },
    { bp: 'Mobile',  key: 'mobile',  w: 328, h: 185, type: 'image', ratio: '16:9', note: 'Imagen superior' },
  ],
  'Modal V2': [
    { bp: 'Desktop', key: 'desktop', w: 720, h: 500, type: 'image', ratio: '4:5', note: 'Imagen completa' },
    { bp: 'Tablet',  key: 'tablet',  w: 472, h: 500, type: 'image', ratio: '4:5', note: 'Imagen completa' },
    { bp: 'Mobile',  key: 'mobile',  w: 328, h: 437, type: 'image', ratio: '3:4', note: 'Imagen completa' },
  ],
  'Modal V3': [
    { bp: 'Única versión', key: 'default', w: 328, h: 487, type: 'bg', ratio: '2:3', note: 'Fondo color/degradé + misceláneas del KV' },
  ],
}

export const GENERATION_SPEC = `
## ESPECIFICACIONES TÉCNICAS OBLIGATORIAS

### Modal V1 — Beneficio Económico
Objetivo: comunicar ahorro, descuento o beneficio económico. La imagen acompaña sin competir con el precio.
| Breakpoint | Ancho  | Alto   | Imagen            | Aspect Ratio |
|------------|--------|--------|-------------------|--------------|
| Desktop    | 720px  | 526px  | Lateral izquierda | 9:16         |
| Tablet     | 472px  | 444px  | Superior          | 5:2          |
| Mobile     | 328px  | 432px  | Superior          | 16:9         |
Tipografía título: Arial Bold 32px (no modificable)
Tipografía precio: Arial Bold 38px (no modificable)
Estructura: Close Button · Product Set · Título (máx. 3 líneas)

### Modal V2 — Conexión Emocional
Objetivo: generar identificación emocional. La imagen es el vehículo narrativo principal.
| Breakpoint | Ancho  | Alto   | Imagen   | Aspect Ratio |
|------------|--------|--------|----------|--------------|
| Desktop    | 720px  | 620px  | Completa | 4:5          |
| Tablet     | 472px  | 600px  | Completa | 4:5          |
| Mobile     | 328px  | 513px  | Completa | 4:5          |
Elementos: Close Button (sup. derecha) · Product Set (sup. izquierda) · Título (inferior)
Tipografía título: Arial Bold 32px (no modificable)
Tipografía precio: Arial Bold 40px (no modificable)
CTA ubicado a la derecha.

### Modal V3 — No te vayas
Objetivo: reducir abandono. Comunicación directa, foco en oferta y CTA.
| Breakpoint             | Ancho  | Alto   | Imagen   | Aspect Ratio |
|------------------------|--------|--------|----------|--------------|
| Desktop/Tablet/Mobile  | 328px  | 561px  | Superior | 16:9         |
Título: Arial Bold 28px · máx. 3 líneas (no modificable)
Bajada: Arial Regular 16px · máx. 2 líneas (no modificable)
Precio: Arial Bold 40px (no modificable)
Evitar composiciones agresivas o excesivamente promocionales.

### Paywall — Landing de Suscripción
Objetivo: presentar opciones de plan y facilitar la conversión.
- Altura fija del background: 500px en todos los breakpoints.
- Safe area superior para Navbar: 80px mínimo.
- Safe area de imagen: W Fill Container / H 420px.
- Sello/logo promocional: contenedor fijo 288×96px.
- Márgenes mínimos:
  - Desktop 1920px: 309px | Desktop 1280px: 32px
  - Tablet 1279px/768px: 24px
  - Mobile 767px/360px: 16px

### Reglas de composición (todas las piezas)
- Background SIEMPRE por color hexadecimal (sólido o gradiente). NUNCA imagen de fondo.
- Máximo 2 assets por composición. Separados en frame izquierdo y frame derecho.
- Área de contenido (logo, título, cards, CTAs) no puede ser invadida por imágenes.
- En Mobile (Paywall): solo color de fondo, sin imágenes decorativas.
- Sin transparencias sobre texto.
- Contraste WCAG 2.1 AA mínimo.
- Touch Target CTA: Fill Container × 40px de alto.

### Tipografía (referencia para proposición)
- LN/CLN títulos: text-heading/sm/font-bold/32-110
- LN/CLN cuerpo: text-body/md/font-normal/16-140
- Foodit títulos: PrumoS | Foodit cuerpo: Roboto

### Exportación de assets
- PNG para imágenes · SVG para íconos/vectores · WebP para imágenes pesadas
- Peso máximo 500 KB por asset
- Hasta 2 imágenes, en frame izquierdo y frame derecho
`
