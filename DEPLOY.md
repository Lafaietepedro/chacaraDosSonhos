# Deploy no Vercel - Espaço Vip JR

## Configuração para Produção

### 1. Banco de Dados
Para produção, você precisa de um banco PostgreSQL. Opções recomendadas:

- **Vercel Postgres** (recomendado)
- **Supabase** (gratuito)
- **PlanetScale**
- **Railway**

### 2. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis no painel do Vercel:

```bash
# Obrigatório - Banco de dados PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database"

# Dashboard Authentication
DASHBOARD_USERNAME="admin"
DASHBOARD_PASSWORD="sua_senha_segura"

# WhatsApp (opcional)
WHATSAPP_PHONE="+5511999999999"
CALLMEBOT_API_KEY="seu_api_key"

# App URL
NEXT_PUBLIC_APP_URL="https://seu-dominio.vercel.app"
```

### 3. Deploy Steps

1. **Conecte seu repositório ao Vercel**
2. **Configure as variáveis de ambiente**
3. **Adicione um banco PostgreSQL**
4. **Execute o deploy**

### 4. Pós-Deploy

Após o deploy, execute as migrações do banco:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma db push
```

### 5. Troubleshooting

#### Erro de Build
Se houver erro de build relacionado ao Prisma:

1. Verifique se `DATABASE_URL` está configurada
2. Execute `npx prisma generate` localmente
3. Verifique se não há erros de TypeScript

#### Erro de Conexão com Banco
1. Verifique se o banco PostgreSQL está ativo
2. Confirme se `DATABASE_URL` está correta
3. Teste a conexão localmente

### 6. Scripts Úteis

```bash
# Build local para testar
npm run build:vercel

# Verificar banco
npm run db:studio

# Gerar cliente Prisma
npm run db:generate
```

## Estrutura de Arquivos

- `prisma/schema.prisma` - Schema para desenvolvimento (SQLite)
- `prisma/schema-production.prisma` - Schema para produção (PostgreSQL)
- `lib/prisma.ts` - Cliente Prisma com fallbacks
- `vercel.json` - Configuração do Vercel
- `scripts/build.sh` - Script de build customizado
