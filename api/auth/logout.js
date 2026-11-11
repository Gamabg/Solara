import { clearSessionCookie } from '../../server/auth.js'
import { handleCors, requireMethod } from '../../server/http.js'

export default function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['POST'])) return
  clearSessionCookie(res)
  return res.status(200).json({ success: true })
}
