import { createClient } from '@supabase/supabase-js'
import { neon } from '@neondatabase/serverless'
import { loadEnv } from 'vite'

for (const [key, value] of Object.entries(loadEnv('development', process.cwd(), ''))) {
  if (!process.env[key]) process.env[key] = value
}

const {
  DATABASE_URL,
  SOURCE_SUPABASE_URL,
  SOURCE_SUPABASE_SERVICE_ROLE_KEY,
} = process.env

if (!DATABASE_URL || !SOURCE_SUPABASE_URL || !SOURCE_SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Configure DATABASE_URL, SOURCE_SUPABASE_URL e SOURCE_SUPABASE_SERVICE_ROLE_KEY no ambiente local.')
}

const supabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const sql = neon(DATABASE_URL)
const pageSize = 500
let migratedProducts = 0
let migratedContent = 0

for (let offset = 0; ; offset += pageSize) {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, lines, tone, color_label, swatch, price, active, created_at')
    .order('created_at')
    .order('id')
    .range(offset, offset + pageSize - 1)

  if (error) throw new Error(`Falha ao ler produtos do Supabase: ${error.message}`)
  if (!products.length) break

  for (const product of products) {
    await sql`
      insert into public.products (
        id, name, lines, tone, color_label, swatch, price, active, created_at
      )
      values (
        ${product.id},
        ${product.name},
        ${JSON.stringify(product.lines)}::jsonb,
        ${product.tone},
        ${product.color_label},
        ${product.swatch},
        ${product.price},
        ${product.active},
        ${product.created_at}
      )
      on conflict (id) do update set
        name = excluded.name,
        lines = excluded.lines,
        tone = excluded.tone,
        color_label = excluded.color_label,
        swatch = excluded.swatch,
        price = excluded.price,
        active = excluded.active,
        created_at = excluded.created_at
    `
    migratedProducts += 1
  }

  if (products.length < pageSize) break
}

const { data: contentRows, error: contentError } = await supabase
  .from('store_content')
  .select('id, value')
  .order('id')

if (contentError) throw new Error(`Falha ao ler o conteúdo da loja: ${contentError.message}`)
for (const contentRow of contentRows) {
  await sql`
    insert into public.store_content (id, value)
    values (${contentRow.id}, ${JSON.stringify(contentRow.value)}::jsonb)
    on conflict (id) do update set value = excluded.value, updated_at = now()
  `
  migratedContent += 1
}

const [targetCount] = await sql`
  select count(*)::integer as count from public.products
`
if (Number(targetCount.count) < migratedProducts) {
  throw new Error('A verificação final encontrou menos produtos no Neon do que os copiados.')
}
const [targetContentCount] = await sql`
  select count(*)::integer as count from public.store_content
`
if (Number(targetContentCount.count) < migratedContent) {
  throw new Error('A verificação final encontrou menos registros de conteúdo no Neon do que os copiados.')
}

console.log(`Migração concluída: ${migratedProducts} produtos e ${migratedContent} registros de conteúdo copiados.`)
console.log(`Registros no Neon após a cópia: ${targetCount.count} produtos e ${targetContentCount.count} conteúdos.`)
console.log('Contas e senhas do Supabase não foram migradas; crie uma nova conta administradora no Neon.')
