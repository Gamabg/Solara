import { neon } from '@neondatabase/serverless'

let client = null

export function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não foi configurada.')
  }
  if (!client) client = neon(process.env.DATABASE_URL)
  return client
}
