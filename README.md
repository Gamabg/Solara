# Solara

Loja Solara Energia em Movimento, feita com React e Vite. A arquitetura nova usa PostgreSQL no Neon, uma API de funções da Vercel e um painel administrativo que pode ser publicado como um projeto Vercel separado.

## Arquitetura

```text
Site Solara ─────┐
                 ├── API na Vercel ─── PostgreSQL no Neon
Painel separado ─┘
```

O painel e o site usam a mesma API. O painel atualiza produtos e conteúdo; o site lê os dados dessa API. O administrador tem uma conta única, pode alterar o próprio e-mail/senha e gerenciar produtos, categorias, textos e áreas visíveis.

## Preparar o banco e a conta

1. Crie um banco PostgreSQL no [Neon](https://neon.tech/).
2. No SQL Editor do Neon, execute [`database/schema.sql`](./database/schema.sql).
3. Copie `.env.example` para `.env.local` e preencha as variáveis:
   - `DATABASE_URL`: connection string do Neon.
   - `AUTH_SECRET`: segredo aleatório com pelo menos 32 bytes. Gere um localmente com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
   - `SOURCE_SUPABASE_URL` e `SOURCE_SUPABASE_SERVICE_ROLE_KEY`: necessárias apenas para migrar os produtos e o conteúdo conhecidos do projeto atual.
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD`: usadas para criar a conta inicial. Escolha uma senha exclusiva com pelo menos 12 caracteres e no máximo 72 bytes.

Mantenha essas variáveis em `.env.local` ou nas configurações privadas da Vercel. Nunca use o prefixo `VITE_` em credenciais do banco, segredo de sessão ou chave `service_role`, nem as envie ao navegador ou ao Git.

## Migrar os dados conhecidos do Supabase

Com o schema aplicado e as variáveis de origem e destino configuradas localmente, execute:

```bash
npm run migrate:supabase
npm run create:admin
```

A migração copia `products` e `store_content` para o Neon sem apagar nem alterar o Supabase. Ela pode ser executada novamente e atualiza os registros pelos IDs existentes. Contas/senhas do Supabase não são migradas: crie uma nova conta administradora com `npm run create:admin`.

O código deste projeto conhece essas duas tabelas e a tabela `user_roles` do schema antigo. Se o seu projeto Supabase tiver outras tabelas, arquivos no Storage ou dados fora desse schema, eles precisam ser inventariados e migrados separadamente. Faça e mantenha um backup do Supabase; só encerre o serviço antigo depois de validar a loja e o painel no Neon.

## Publicar na Vercel

Use o repositório atual em dois projetos da Vercel. Defina o diretório raiz como a raiz do repositório em ambos:

### Projeto do painel

- Comando de build: `npm run build:admin`
- Diretório de saída: `dist-admin`
- Variáveis privadas: `DATABASE_URL`, `AUTH_SECRET` e `ALLOWED_ORIGINS`.
- `ALLOWED_ORIGINS` deve conter as origens exatas do painel e da loja, separadas por vírgula e sem barra final.
- Como a pasta `api/` está na raiz, as funções da API são publicadas com esse projeto. O painel pode chamar `/api` na própria origem.
- Configure `VITE_STORE_URL` com a URL pública da loja.

### Projeto do site

- Comando de build: `npm run build`
- Diretório de saída: `dist`
- Configure `VITE_API_URL` com a origem do projeto do painel e `VITE_ADMIN_URL` com a URL pública do painel.

Em produção, prefira domínios próprios na mesma zona, por exemplo `loja.seudominio.com` e `admin.seudominio.com`. Isso evita problemas de cookies entre domínios `vercel.app`. A API usa cookie `HttpOnly`, exige origem permitida nas alterações e limita tentativas de login.

## Executar e validar

```bash
npm install
npm run build
npm run build:admin
```

`npm run dev` executa o site de demonstração local. Para testar as funções da Vercel localmente, use o CLI da Vercel (`vercel dev`) depois de configurar as variáveis de ambiente.

O carrinho continua salvo no navegador. Checkout, pagamentos, pedidos e upload de imagens não estão implementados neste projeto.
