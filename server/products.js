const VALID_TONES = new Set(['black', 'sand', 'offwhite'])

export function normalizeProduct(product) {
  const price = Number(product.price)
  const valid = typeof product.name === 'string'
    && product.name.trim().length > 0
    && product.name.length <= 200
    && Array.isArray(product.lines)
    && product.lines.length > 0
    && product.lines.length <= 10
    && product.lines.every((line) => typeof line === 'string'
      && line.trim().length > 0 && line.length <= 80)
    && VALID_TONES.has(product.tone)
    && typeof product.colorLabel === 'string'
    && product.colorLabel.trim().length > 0
    && product.colorLabel.length <= 50
    && typeof product.swatch === 'string'
    && /^#[\da-f]{6}$/i.test(product.swatch)
    && Number.isFinite(price)
    && price > 0
    && price <= 99999999.99
    && typeof product.active === 'boolean'

  if (!valid) return null
  return {
    name: product.name.trim(),
    lines: JSON.stringify(product.lines.map((line) => line.trim())),
    tone: product.tone,
    colorLabel: product.colorLabel.trim(),
    swatch: product.swatch,
    price,
    active: product.active,
  }
}
