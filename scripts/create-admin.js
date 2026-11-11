import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'
import { loadEnv } from 'vite'

for (const [key, value] of Object.entries(loadEnv('development', process.cwd(), ''))) {
  if (!process.env[key]) process.env[key] = value
}

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Configure DATABASE_URL, ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.')
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL.trim())) {
  throw new Error('ADMIN_EMAIL deve ser um e-mail válido.')
}
if (ADMIN_PASSWORD.length < 12 || Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) {
  throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres e no máximo 72 bytes.')
}

const sql = neon(DATABASE_URL)
const [existingAdmin] = await sql`
  select id from public.admin_users limit 1
`
if (existingAdmin) {
  throw new Error('Já existe um administrador. O script não altera contas existentes.')
}

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
await sql`
  insert into public.admin_users (email, password_hash)
  values (${ADMIN_EMAIL.trim().toLowerCase()}, ${passwordHash})
`
console.log(`Conta administradora criada para ${ADMIN_EMAIL.trim().toLowerCase()}.`)
