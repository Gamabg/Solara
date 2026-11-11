import { getAdmin } from '../server/auth.js'
import { getDatabase } from '../server/database.js'
import { getBody, handleCors, reportError, requireMethod } from '../server/http.js'

export default async function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['GET', 'PUT'])) return

  try {
    const sql = getDatabase()
    if (req.method === 'GET') {
      const [row] = await sql`
        select value
        from public.store_content
        where id = 'home'
        limit 1
      `
      return res.status(200).json({ content: row?.value || null })
    }

    if (!await getAdmin(req)) {
      return res.status(401).json({ error: 'É necessário entrar como administrador.' })
    }
    const { content } = getBody(req)
    if (!content || typeof content !== 'object' || Array.isArray(content)
      || JSON.stringify(content).length > 100_000) {
      return res.status(400).json({ error: 'O conteúdo da loja é inválido.' })
    }

    const [row] = await sql`
      insert into public.store_content (id, value)
      values ('home', ${JSON.stringify(content)}::jsonb)
      on conflict (id) do update
      set value = excluded.value, updated_at = now()
      returning value
    `
    return res.status(200).json({ content: row.value })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: reportError('conteúdo da loja', error),
    })
  }
}
