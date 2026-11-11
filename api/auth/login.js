import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { createSession } from '../../server/auth.js'
import { getDatabase } from '../../server/database.js'
import { getBody, handleCors, reportError, requireMethod } from '../../server/http.js'

const DUMMY_PASSWORD_HASH = '$2b$12$YQcIM3Tomdq7mNPs9ClYGefneklwM1ogwgSbbJ59GSHyNf9AmxOta'

function getAttemptKey(value) {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

async function recordAttempt(sql, key) {
  const [attempt] = await sql`
    insert into public.auth_login_attempts (key, attempts, window_started_at)
    values (${key}, 1, now())
    on conflict (key) do update set
      attempts = case
        when public.auth_login_attempts.window_started_at < now() - interval '15 minutes' then 1
        else public.auth_login_attempts.attempts + 1
      end,
      window_started_at = case
        when public.auth_login_attempts.window_started_at < now() - interval '15 minutes' then now()
        else public.auth_login_attempts.window_started_at
      end
    returning attempts
  `
  return Number(attempt.attempts)
}

export default async function handler(req, res) {
  if (handleCors(req, res) || requireMethod(req, res, ['POST'])) return

  try {
    const { email, password } = getBody(req)
    if (typeof email !== 'string' || typeof password !== 'string'
      || email.length > 254 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos.' })
    }

    const sql = getDatabase()
    const attemptKey = getAttemptKey(email)
    const forwardedIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    const ipKey = getAttemptKey(`ip:${forwardedIp || 'unknown'}`)
    await sql`delete from public.auth_login_attempts where window_started_at < now() - interval '1 day'`
    const emailAttempts = await recordAttempt(sql, `email:${attemptKey}`)
    const ipAttempts = await recordAttempt(sql, ipKey)
    if (emailAttempts > 5 || ipAttempts > 25) {
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' })
    }

    const [admin] = await sql`
      select id, email, password_hash,
        (extract(epoch from updated_at) * 1000)::bigint as "updatedAt"
      from public.admin_users
      where lower(email) = lower(${email.trim()}) and active = true
      limit 1
    `
    const passwordMatches = await bcrypt.compare(password, admin?.password_hash || DUMMY_PASSWORD_HASH)

    if (!admin || !passwordMatches) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
    }

    await sql`
      delete from public.auth_login_attempts
      where key in (${`email:${attemptKey}`}, ${ipKey})
    `
    await createSession(res, admin)
    return res.status(200).json({ user: { id: admin.id, email: admin.email } })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: reportError('login', error),
    })
  }
}
