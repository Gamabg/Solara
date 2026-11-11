import { jwtVerify, SignJWT } from 'jose'
import { getDatabase } from './database.js'

const COOKIE_NAME = 'solara_admin'
const SESSION_DURATION_SECONDS = 60 * 60 * 8

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('AUTH_SECRET deve ter pelo menos 32 caracteres.')
  }
  return new TextEncoder().encode(secret)
}

function getCookieValue(req) {
  const cookies = req.headers.cookie || ''
  const cookie = cookies.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
  return cookie ? cookie.slice(COOKIE_NAME.length + 1) : ''
}

function setSessionCookie(res, token) {
  const production = process.env.NODE_ENV === 'production'
  const secure = production ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION_SECONDS}; SameSite=Lax${secure}`
  )
}

export function clearSessionCookie(res) {
  const production = process.env.NODE_ENV === 'production'
  const secure = production ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`
  )
}

export async function createSession(res, admin) {
  const updatedAt = Number(admin.updatedAt) || admin.updated_at?.getTime?.() || Date.now()
  const token = await new SignJWT({ email: admin.email, updatedAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret())
  setSessionCookie(res, token)
}

export async function getAdmin(req) {
  const token = getCookieValue(req)
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.sub !== 'string') return null
    const sql = getDatabase()
    const [admin] = await sql`
      select id, email, (extract(epoch from updated_at) * 1000)::bigint as "updatedAt"
      from public.admin_users
      where id = ${payload.sub} and active = true
      limit 1
    `
    if (admin && typeof payload.updatedAt === 'number'
      && Number(admin.updatedAt) > payload.updatedAt) return null
    return admin || null
  } catch (error) {
    if (error.code?.startsWith('ERR_JWT_') || error.code?.startsWith('ERR_JWS_')) {
      return null
    }
    throw error
  }
}

export async function requireAdmin(req, res) {
  const admin = await getAdmin(req)
  if (!admin) {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Entre novamente.' })
    return null
  }
  return admin
}
