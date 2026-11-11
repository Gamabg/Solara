import { getAdmin } from '../../server/auth.js'
import { handleCors, reportError, requireMethod } from '../../server/http.js'

export default async function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['GET'])) return

  try {
    const admin = await getAdmin(req)
    if (!admin) return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    return res.status(200).json({ user: admin })
  } catch (error) {
    return res.status(500).json({ error: reportError('verificar sessão', error) })
  }
}
