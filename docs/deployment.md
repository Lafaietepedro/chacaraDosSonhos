# Deploy Do Venue Eventos

Este projeto está preparado para desenvolvimento com SQLite e demonstração pública com PostgreSQL.

## Opção Recomendada

- Aplicação: Vercel.
- Banco: Supabase, Neon ou Railway PostgreSQL.
- Node: 24.x.
- Build command: `npm run build:vercel`.
- Install command: `npm install`.

## Variáveis De Produção

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/venue_eventos?schema=public"
DASHBOARD_USERNAME="admin"
DASHBOARD_PASSWORD="defina-uma-senha-forte"
AUTH_SECRET="gere-uma-string-longa-e-aleatoria"
NEXT_PUBLIC_SITE_URL="https://seu-deploy.vercel.app"
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
2. Configure `DATABASE_URL` e demais variáveis no painel da Vercel.
3. Defina o build command como `npm run build:vercel`.
4. Faça o primeiro deploy.
5. Rode a criação do schema no banco remoto com `prisma db push --schema=prisma/schema-production.prisma`.
6. Rode o seed uma vez apontando para o banco remoto.
7. Troque a senha administrativa no painel após o primeiro login.

## Observações

- SQLite não deve ser usado na demonstração pública porque não representa concorrência real.
- `AUTH_SECRET` é obrigatório em produção; sem ele, sessões administrativas ficam frágeis.
- Mercado Pago está reservado no ambiente, mas a integração de sinal ainda deve ser implementada com checkout, webhook e conciliação em `Payment`.
