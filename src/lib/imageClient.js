const BASE = 'https://image.pollinations.ai/prompt'

/**
 * type: 'bg'    → fondo abstracto, degradé, misceláneas, sin personas
 *       'image' → imagen fotográfica o ilustrada con personas/escenas del KV
 */
export function buildImageUrl(prompt, width, height, type = 'image', seed) {
  const bgSuffix = [
    'no text, no typography, no words, no letters',
    'no people, no faces, no photography',
  ].join(', ')

  const imageSuffix = [
    'no text, no words, no typography, no letters, no numbers',
    'high quality photography or illustration',
    'cinematic lighting, editorial style',
  ].join(', ')

  const suffix = type === 'bg' ? bgSuffix : imageSuffix
  const finalPrompt = `${prompt}, ${suffix}`

  const params = new URLSearchParams({
    width,
    height,
    nologo: 'true',
    seed: seed ?? Math.floor(Math.random() * 99999),
    model: 'flux',
    enhance: 'true',
    format: 'jpeg',
  })

  return `${BASE}/${encodeURIComponent(finalPrompt)}?${params}`
}

export async function downloadImage(url, filename) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    // Fallback: open in new tab if CORS blocks the fetch
    window.open(url, '_blank')
  }
}
