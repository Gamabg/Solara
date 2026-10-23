# Solara

Loja Solara Energia em Movimento, desenvolvida com React e Vite.

## Executar localmente

```bash
npm install
npm run dev
```

Sem credenciais do Supabase, a loja usa os produtos de demonstração. A busca e a sacola funcionam no navegador; a sacola fica salva no armazenamento local. A finalização de pedidos ainda não está conectada a um meio de pagamento.

## Configurar a loja e o painel administrativo

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No SQL Editor do projeto, execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). O script cria as tabelas, os produtos iniciais e as políticas de segurança (RLS).
3. Em **Authentication → Users**, crie o usuário administrador com o e-mail e a senha desejados. Desative o cadastro público em **Authentication → Sign In / Providers → Allow new users to sign up**.
4. No SQL Editor, conceda o papel de administrador ao usuário criado, substituindo o e-mail:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin'
   from auth.users
   where email = 'admin@seudominio.com'
   on conflict (user_id) do update set role = excluded.role;
   ```

5. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores de **Project Settings → API**. Use somente a chave pública/anon no front-end; nunca coloque uma `service_role` key em variáveis `VITE_`.
6. Reinicie o servidor Vite. O ícone de perfil abre `/admin`, onde o administrador pode entrar, adicionar/editar/remover produtos, alterar textos e categorias e mostrar/ocultar áreas da página.

A autorização é conferida pelo Supabase Auth e pelas políticas RLS do banco; esconder a tela no navegador não é usado como controle de segurança. Cadastre apenas os administradores em **Authentication → Users** e em `user_roles`. Em hospedagens estáticas, configure o fallback de rotas para `index.html` para que `/admin` abra corretamente.

## Build

```bash
npm run build
```
