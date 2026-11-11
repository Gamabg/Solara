import { getAdmin } from '../../server/auth.js'
import { getDatabase } from '../../server/database.js'
import { getBody, handleCors, reportError, requireMethod } from '../../server/http.js'
import { normalizeProduct } from '../../server/products.js'

export default async function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['PUT', 'DELETE'])) return

  try {
    if (!await getAdmin(req)) {
      return res.status(401).json({ error: 'É necessário entrar como administrador.' })
    }
    const id = req.query?.id
    if (typeof id !== 'string') return res.status(400).json({ error: 'Identificador inválido.' })

    const sql = getDatabase()
    if (req.method === 'DELETE') {
      const [deleted] = await sql`
        delete from public.products where id = ${id} returning id
      `
      if (!deleted) return res.status(404).json({ error: 'Produto não encontrado.' })
      return res.status(200).json({ success: true })
    }

    const body = getBody(req)
    const product = normalizeProduct(body)
    if (!product) {
      return res.status(400).json({ error: 'Os dados do produto são inválidos.' })
    }
    const [updatedProduct] = await sql`
      update public.products
      set name = ${product.name},
          lines = ${product.lines}::jsonb,
          tone = ${product.tone},
          color_label = ${product.colorLabel},
          swatch = ${product.swatch},
          price = ${product.price},
          active = ${product.active}
      where id = ${id}
      returning id, name, lines, tone, color_label as "colorLabel",
        swatch, price, active, created_at as "createdAt"
    `
    if (!updatedProduct) return res.status(404).json({ error: 'Produto não encontrado.' })
    return res.status(200).json({ product: { ...updatedProduct, price: Number(updatedProduct.price) } })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: reportError('salvar produto', error),
    })
  }
}
