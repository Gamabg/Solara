import bcrypt from 'bcryptjs'
import { createSession, getAdmin } from '../../server/auth.js'
import { getDatabase } from '../../server/database.js'
import { getBody, handleCors, reportError, requireMethod } from '../../server/http.js'

export default async function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['PUT'])) return

  try {
    const admin = await getAdmin(req)
    if (!admin) return res.status(401).json({ error: 'Sessão inválida ou expirada.' })

    const { email, currentPassword, newPassword } = getBody(req)
    if (typeof currentPassword !== 'string' || Buffer.byteLength(currentPassword, 'utf8') > 72) {
      return res.status(400).json({ error: 'Informe sua senha atual.' })
    }
    if (email !== undefined && (typeof email !== 'string' || email.length > 254
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' })
    }
    if (newPassword !== undefined && (typeof newPassword !== 'string' || newPassword.length < 12
      || Buffer.byteLength(newPassword, 'utf8') > 72)) {
      return res.status(400).json({ error: 'A nova senha deve ter entre 12 e 72 bytes.' })
    }
    if (email === undefined && newPassword === undefined) {
      return res.status(400).json({ error: 'Informe um novo e-mail ou uma nova senha.' })
    }

    const sql = getDatabase()
    const [account] = await sql`
      select password_hash
      from public.admin_users
      where id = ${admin.id} and active = true
      limit 1
    `
    if (!account || !(await bcrypt.compare(currentPassword, account.password_hash))) {
      return res.status(401).json({ error: 'A senha atual está incorreta.' })
    }

    const nextEmail = email === undefined ? admin.email : email.trim().toLowerCase()
    const nextPasswordHash = newPassword === undefined
      ? null
      : await bcrypt.hash(newPassword, 12)

    const [updatedAdmin] = await sql`
      update public.admin_users
      set email = ${nextEmail},
          password_hash = coalesce(${nextPasswordHash}, password_hash),
          updated_at = now()
      where id = ${admin.id}
      returning id, email, (extract(epoch from updated_at) * 1000)::bigint as "updatedAt"
    `
    await createSession(res, updatedAdmin)
    return res.status(200).json({ user: updatedAdmin })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' })
    }
    return res.status(error.statusCode || 500).json({
      error: reportError('atualizar perfil', error),
    })
  }
}
