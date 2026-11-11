import { getAdmin } from '../server/auth.js'
import { getDatabase } from '../server/database.js'
import { getBody, handleCors, reportError, requireMethod } from '../server/http.js'
import { normalizeProduct } from '../server/products.js'

export default async function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['GET', 'POST'])) return

  try {
    const sql = getDatabase()

    if (req.method === 'GET') {
      const includeInactive = req.query?.all === 'true'
      if (includeInactive && !await getAdmin(req)) {
        return res.status(401).json({ error: 'É necessário entrar como administrador.' })
      }
      const products = includeInactive
        ? await sql`
          select id, name, lines, tone, color_label as "colorLabel",
            swatch, price, active, created_at as "createdAt"
          from public.products order by created_at
        `
        : await sql`
          select id, name, lines, tone, color_label as "colorLabel",
            swatch, price, active, created_at as "createdAt"
          from public.products where active = true order by created_at
        `
      return res.status(200).json({ products: products.map((product) => ({ ...product, price: Number(product.price) })) })
    }

    if (!await getAdmin(req)) {
      return res.status(401).json({ error: 'É necessário entrar como administrador.' })
    }

    const body = getBody(req)
    const product = normalizeProduct(body)
    if (!product) {
      return res.status(400).json({ error: 'Os dados do produto são inválidos.' })
    }
    const [createdProduct] = await sql`
      insert into public.products (name, lines, tone, color_label, swatch, price, active)
      values (
        ${product.name},
        ${product.lines}::jsonb,
        ${product.tone},
        ${product.colorLabel},
        ${product.swatch},
        ${product.price},
        ${product.active}
      )
      returning id, name, lines, tone, color_label as "colorLabel",
        swatch, price, active, created_at as "createdAt"
    `
    return res.status(201).json({ product: { ...createdProduct, price: Number(createdProduct.price) } })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: reportError('produtos', error),
    })
  }
}
