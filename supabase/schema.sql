create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lines text[] not null,
  tone text not null check (tone in ('black', 'sand', 'offwhite')),
  color_label text not null,
  swatch text not null,
  price numeric(10, 2) not null check (price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.store_content (
  id text primary key,
  value jsonb not null
);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.store_content enable row level security;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select to anon, authenticated
  using (active or (select public.is_store_admin()));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check ((select public.is_store_admin()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update to authenticated
  using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_store_admin()));

drop policy if exists "Anyone can read store content" on public.store_content;
create policy "Anyone can read store content"
  on public.store_content for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert store content" on public.store_content;
create policy "Admins can insert store content"
  on public.store_content for insert to authenticated
  with check ((select public.is_store_admin()));

drop policy if exists "Admins can update store content" on public.store_content;
create policy "Admins can update store content"
  on public.store_content for update to authenticated
  using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.products, public.store_content to anon, authenticated;
grant select on public.user_roles to authenticated;
grant insert, update, delete on public.products, public.store_content to authenticated;
grant execute on function public.is_store_admin() to anon, authenticated;

insert into public.products (name, lines, tone, color_label, swatch, price, active)
select seed.name, seed.lines, seed.tone, seed.color_label, seed.swatch, seed.price, true
from (values
  ('Hoje eu escolhi leveza', array['Hoje eu', 'escolhi', 'leveza']::text[], 'black', 'Preta', '#2a2623', 89.90::numeric),
  ('Endorfina espiritual', array['Endorfina', 'espiritual']::text[], 'sand', 'Areia', '#d8b987', 89.90::numeric),
  ('Respira. Confia. Recebe.', array['Respira.', 'Confia.', 'Recebe.']::text[], 'offwhite', 'Off-white', '#f4efe4', 89.90::numeric),
  ('Cancelando boletos ruins', array['Cancelando', 'boletos', 'ruins']::text[], 'black', 'Preta', '#2a2623', 89.90::numeric)
) as seed(name, lines, tone, color_label, swatch, price)
where not exists (
  select 1 from public.products existing where existing.name = seed.name
);

insert into public.store_content (id, value)
values ('home', '{
  "heroTitle": "Hoje eu escolhi leveza.",
  "heroDescription": "Camisetas com frases que a gente precisa ouvir todo dia. Feitas pra treino, pra rua e pra qualquer lugar onde o sol te encontrar.",
  "heroCta": "Ver coleção",
  "showHero": true,
  "productTitle": "Camisetas femininas com frase",
  "productNote": "As mais pedidas da semana",
  "showProducts": true,
  "categoriesTitle": "Compre por categoria",
  "categoriesNote": "Atualizado toda semana",
  "categories": [
    {"id":"feminino","title":"Feminino","description":"Camisetas com frase e conjuntos","href":"#feminino","tone":"sand"},
    {"id":"masculino","title":"Masculino","description":"Básicos pro treino e pra rua","href":"#colecoes","tone":"sage"},
    {"id":"frases","title":"Frases","description":"Escolha a mensagem do seu dia","href":"#colecoes","tone":"ink"}
  ],
  "showCategories": true,
  "showFooter": true
}'::jsonb)
on conflict (id) do nothing;
