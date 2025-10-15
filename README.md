# Espaço Vip JR

## Sobre o Projeto

Este é um aplicativo web responsivo para gerenciar e alugar uma chácara para eventos. O sistema foi desenvolvido para automatizar reservas, pagamentos, contratos e comunicação, reduzindo o trabalho manual.

## Funcionalidades

### Prioridade Alta (MVP)
- ✅ Página pública da chácara com galeria, descrição, capacidade, tabela de preços e FAQ
- ✅ Calendário de disponibilidade visual (bloquear datas manualmente)
- ✅ Fluxo de reserva: seleção de data, número de convidados, extras, resumo preço
- ✅ Confirmação provisória + solicitação de sinal (pagamento mínimo)
- ✅ Painel do host: ver reservas, aprovar/recusar, bloquear datas, editar preço/extras
- ✅ Notificações por e-mail + integração com WhatsApp (link ou API) para confirmação rápida
- ✅ Contrato padrão em PDF gerado automaticamente com opção de assinatura eletrônica simples
- ✅ Gestão de fotos (upload, ordem), e campo para "regras da casa"

### Prioridade Média (próximas versões)
- 🔄 Pagamento online (Stripe + PIX / PayPal) e emissão de recibo/fatura
- 🔄 Integração com Google Calendar (para exportar reservas)
- 🔄 Sistema simples de avaliações/reviews pós-evento
- 🔄 Relatórios básicos (reservas por mês, receita)

## Stack Tecnológica

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + TypeScript + Express
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT + refresh tokens
- **Pagamentos**: Stripe (cartão) + PIX
- **Hospedagem**: Vercel (frontend) + Render (backend)

## Instalação

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd chacaraDosSonhos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chacara_dos_sonhos"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SENDGRID_API_KEY="SG..."
FROM_EMAIL="noreply@chacaradossonhos.com"

# WhatsApp
WHATSAPP_API_URL="https://api.whatsapp.com/send"
WHATSAPP_PHONE="+5511999999999"

# Cloudinary (para upload de imagens)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Configure o banco de dados**
```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar as migrações
npm run db:migrate

# (Opcional) Abrir o Prisma Studio
npm run db:studio
```

5. **Execute o projeto**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
chacaraDosSonhos/
├── app/                    # App Router do Next.js
│   ├── booking/           # Página de reserva
│   ├── dashboard/         # Painel do host
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Card, etc.)
│   ├── calendar.tsx      # Calendário de disponibilidade
│   ├── contact.tsx       # Seção de contato
│   ├── faq.tsx          # Perguntas frequentes
│   ├── footer.tsx       # Rodapé
│   ├── gallery.tsx      # Galeria de fotos
│   ├── header.tsx       # Cabeçalho
│   ├── hero.tsx         # Seção hero
│   ├── pricing.tsx      # Tabela de preços
│   └── about.tsx        # Seção sobre
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Funções utilitárias
├── prisma/              # Schema e migrações do banco
│   └── schema.prisma    # Schema do banco de dados
├── public/              # Arquivos estáticos
└── README.md           # Este arquivo
```

## Funcionalidades Implementadas

### Página Pública
- ✅ Design responsivo e moderno
- ✅ Seção hero com call-to-action
- ✅ Galeria de fotos com lightbox
- ✅ Informações sobre a chácara
- ✅ Tabela de preços com pacotes
- ✅ FAQ interativo
- ✅ Formulário de contato
- ✅ Integração com WhatsApp

### Sistema de Reservas
- ✅ Fluxo de 4 etapas:
  1. Seleção de data e número de convidados
  2. Escolha do pacote (Básico, Completo, Premium)
  3. Seleção de extras opcionais
  4. Informações do cliente
- ✅ Cálculo automático de preços
- ✅ Resumo da reserva em tempo real
- ✅ Validação de formulários

### Painel do Host
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de reservas (aprovar/recusar)
- ✅ Calendário de disponibilidade
- ✅ Bloqueio/desbloqueio de datas
- ✅ Configurações da propriedade

### Calendário de Disponibilidade
- ✅ Visualização mensal
- ✅ Diferentes status: disponível, reservado, bloqueado
- ✅ Navegação entre meses
- ✅ Legendas e indicadores visuais

## Próximos Passos

### Implementações Pendentes
1. **Sistema de Pagamentos**
   - Integração com Stripe
   - Pagamento via PIX
   - Emissão de recibos

2. **Notificações**
   - Email automático para confirmações
   - Integração com WhatsApp Business API
   - Notificações push (PWA)

3. **Contratos e Assinatura**
   - Geração de PDFs
   - Assinatura eletrônica
   - Armazenamento seguro

4. **Gestão de Mídia**
   - Upload de fotos
   - Organização da galeria
   - Otimização de imagens

5. **Sistema de Avaliações**
   - Reviews pós-evento
   - Sistema de rating
   - Moderação de comentários

## Deploy

### Frontend (Vercel)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Backend (Render)
1. Conecte o repositório
2. Configure as variáveis de ambiente
3. Configure o banco PostgreSQL

### Banco de Dados
- Use um serviço gerenciado como Supabase, PlanetScale ou Railway
- Configure as variáveis de conexão



