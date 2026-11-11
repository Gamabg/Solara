create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_users_single_account
  on public.admin_users ((true));

create table if not exists public.auth_login_attempts (
  key text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now()
);

create index if not exists auth_login_attempts_window_idx
  on public.auth_login_attempts (window_started_at);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lines jsonb not null,
  tone text not null check (tone in ('black', 'sand', 'offwhite')),
  color_label text not null,
  swatch text not null,
  price numeric(10, 2) not null check (price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.store_content (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
