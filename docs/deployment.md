# Deploy Do Venue Eventos Com Supabase

Este projeto está preparado para desenvolvimento com SQLite e demonstração pública com Supabase, que é PostgreSQL gerenciado.

## Opção Recomendada

- Aplicação: Vercel.
- Banco: Supabase PostgreSQL.
- Node: 24.x.
- Build command: `npm run build:vercel`.
- Install command: `npm install`.

## URLs Do Supabase

No painel do Supabase, abra o projeto e vá em **Connect**. Use duas URLs:

- `DATABASE_URL`: URL usada pela aplicação em runtime. Em Vercel/serverless, use o **Transaction Pooler** do Supabase, normalmente na porta `6543`, com `?pgbouncer=true`.
- `DIRECT_URL`: URL usada pelo Prisma CLI para `db push`, migrações e seed. Use a conexão direta `db.PROJECT_REF.supabase.co:5432` ou o **Session Pooler** na porta `5432`.

## Variáveis De Produção Na Vercel

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:SENHA@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:SENHA@db.PROJECT_REF.supabase.co:5432/postgres"
DASHBOARD_USERNAME="admin"
DASHBOARD_PASSWORD="defina-uma-senha-forte"
AUTH_SECRET="gere-uma-string-longa-e-aleatoria"
NEXT_PUBLIC_SITE_URL="https://seu-deploy.vercel.app"
NEXT_PUBLIC_CONTACT_EMAIL="contato@lpemsoftware.com.br"
NEXT_PUBLIC_CONTACT_PHONE=""
NEXT_PUBLIC_WHATSAPP_PHONE=""
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Venue Eventos <reservas@seudominio.com.br>"
WHATSAPP_PHONE="5561999999999"
WHATSAPP_WEBHOOK_URL=""
CALLMEBOT_API_KEY=""
MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_WEBHOOK_SECRET=""
```

## Passo A Passo

1. Crie o banco PostgreSQL no provedor escolhido.
2. Copie a URL do Transaction Pooler para `DATABASE_URL`.
3. Copie a URL direta ou Session Pooler para `DIRECT_URL`.
4. Configure as demais variáveis no painel da Vercel.
5. Defina o build command como `npm run build:vercel`.
6. Faça o primeiro deploy.
7. Rode a criação do schema no banco remoto com `npm run db:push:prod` usando as variáveis de produção carregadas no ambiente local.
8. Rode `npm run db:seed:prod` uma vez apontando para o banco remoto.
9. Troque a senha administrativa no painel após o primeiro login.

## Dados Para A Demonstração Pública

Depois de criar o schema e executar o seed principal, a vitrine pode receber reservas, contatos, receita e bloqueios fictícios:

```bash
ALLOW_DEMO_SEED=true NODE_ENV=production npm run demo:seed
```

O comando é idempotente para os registros de demonstração e exige a autorização explícita por variável de ambiente. Não use esse seed em um banco que já esteja atendendo clientes reais.

## Rodando O Schema No Supabase

Antes de executar comandos contra produção, confira se `DATABASE_URL` e `DIRECT_URL` apontam para o Supabase:

```bash
npm run db:validate:prod
npm run db:generate:prod
npm run db:push:prod
npm run db:seed:prod
```

Os scripts `db:*:prod` carregam `.env` e `.env.local`, com `.env.local` tendo prioridade para desenvolvimento local. Em deploy, as variáveis configuradas no provedor continuam tendo prioridade.

## Observações

- SQLite não deve ser usado na demonstração pública porque não representa concorrência real.
- `AUTH_SECRET` é obrigatório em produção; sem ele, sessões administrativas ficam frágeis.
- `DIRECT_URL` não deve ser exposta no frontend. Ela é usada apenas por Prisma CLI e pelo build.
- Mercado Pago está reservado no ambiente, mas a integração de sinal ainda deve ser implementada com checkout, webhook e conciliação em `Payment`.
