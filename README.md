# Venue Eventos — demonstração Villa Aurora

Venue Eventos é uma base full stack para operação de espaços de eventos. A interface pública atual usa a marca fictícia **Villa Aurora** para demonstrar o produto com dados, valores e imagens ilustrativos.

Este é um projeto próprio da LPeM Software & Automation para portfólio técnico. Não representa um cliente, espaço ou operação comercial real.

## O problema demonstrado

Pedidos recebidos por canais dispersos, cálculos manuais e agendas separadas aumentam o risco de:

- conflito de datas;
- preços inconsistentes;
- perda de contexto de contatos e solicitações;
- ausência de histórico operacional.

## O fluxo implementado

### Área pública

- vitrine responsiva da Villa Aurora;
- catálogo carregado do backend;
- pacotes, capacidade, taxa e adicionais vindos da mesma fonte de dados;
- estimativa calculada pela mesma regra pura usada no backend;
- seleção de adicionais com IDs e quantidades reais;
- consulta mensal de datas indisponíveis sem exposição de dados pessoais;
- nova verificação transacional da data no envio;
- rejeição quando o catálogo muda entre carregamento e envio;
- formulário de contato;
- solicitação de reserva em etapas;
- solicitação sob medida registrada como reserva em análise.

### Área administrativa

- login com senha protegida por `scrypt`;
- sessão em cookie HttpOnly assinada por HMAC;
- indicadores operacionais;
- reservas paginadas e filtráveis;
- transições de status validadas;
- calendário de reservas e bloqueios;
- contatos;
- edição de propriedade, pacotes e adicionais;
- proposta sob medida;
- geração de proposta/contrato em PDF;
- troca de senha.

## Consistência e segurança do fluxo

O frontend não relaciona pacotes por posição no array. O mesmo objeto de catálogo fornece:

- nome e preço exibidos;
- capacidade incluída;
- tarifa por convidado adicional;
- ID enviado ao backend;
- adicionais e quantidades;
- taxa operacional fixa.

O backend recalcula o total e compara com `expectedTotal`. Se o catálogo tiver mudado, retorna conflito e não cria a reserva silenciosamente com outro preço.

Datas passadas, datas bloqueadas e conflitos com reservas `PENDING` ou `CONFIRMED` são rejeitados no servidor. O número de convidados também é limitado pela capacidade da propriedade.

Os endpoints GET de catálogo e disponibilidade são somente leitura. Inicialização e reconciliação de dados ficam no seed explícito.

## Identidade da demonstração

- **Produto/base técnica:** Venue Eventos
- **Marca fictícia pública:** Villa Aurora
- **Autoria:** LPeM Software & Automation

O frontend valida a identidade `Villa Aurora` recebida do backend antes de habilitar formulários. Isso impede que uma interface de uma propriedade grave dados em outra base por configuração incorreta de `BACKEND_BASE_URL`.

## Stack

- Next.js 16 com App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite em desenvolvimento
- PostgreSQL/Supabase no schema de produção
- API Routes
- ESLint 9
- testes com `node:test`
- Node 24 recomendado

## Estrutura principal

```text
app/
  api/availability/              Datas públicas indisponíveis
  api/bookings/                  Criação e operação de reservas
  api/catalog/                   Catálogo público somente leitura
  api/contact/                   Contatos
  backend-proxy/                 Proxy opcional para backend separado
  dashboard/                     Painel administrativo
components/
  villa-aurora-site.tsx          Interface pública
config/
  villa-aurora.json              Fonte canônica da demonstração
lib/
  public-booking.ts              Estimativa e payload da UI
  services/availability.ts       Disponibilidade e intervalos
  services/booking.service.ts    Criação transacional
  services/pricing.ts            Regra pura de preço
  services/property.service.ts   Consulta e bootstrap explícito
prisma/
  schema.prisma                  SQLite local
  schema-production.prisma       PostgreSQL
  seed.js                        Sincronização explícita da demo
```

## Desenvolvimento local

Requisitos:

- Node.js 24
- npm

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

A aplicação abre em `http://localhost:3000`.

`npm run db:seed` sincroniza propriedade, preços, pacotes e adicionais com `config/villa-aurora.json`. Ele pode sobrescrever edições administrativas da demonstração. Por segurança, o comando aborta se encontrar uma propriedade ativa que não seja Villa Aurora nem uma identidade legada conhecida; não o execute contra bancos de clientes ou outras operações.

As credenciais padrão `admin` / `admin123` existem somente fora de produção. Configure `DASHBOARD_USERNAME`, `DASHBOARD_PASSWORD` e um `AUTH_SECRET` longo antes de qualquer ambiente compartilhado.

## Validação

```bash
npm test
npm run lint
./node_modules/.bin/tsc --noEmit
npm audit --omit=dev
npx -p node@24 npm run build
```

A suíte cobre preço, adicionais, capacidade, catálogo, datas passadas, intervalos indisponíveis, reservas ativas, validação de payload, status, rate limiting, propostas e PDF.

## Produção

A demonstração pode operar de duas formas:

1. uma aplicação Next.js com PostgreSQL configurado diretamente; ou
2. uma Vercel de frontend com `BACKEND_BASE_URL` encaminhando `/api/*` a outra implantação do mesmo backend.

No segundo modelo, frontend e backend precisam ser publicados juntos. A origem deve executar conscientemente a sincronização do seed antes de habilitar os formulários públicos, após backup e confirmação de que o banco pertence à demonstração Villa Aurora.

Variáveis obrigatórias ou recomendadas:

- `DATABASE_URL` e `DIRECT_URL` para PostgreSQL;
- `AUTH_SECRET`;
- `DASHBOARD_USERNAME` e `DASHBOARD_PASSWORD` no primeiro seed;
- `NEXT_PUBLIC_SITE_URL`;
- `BACKEND_BASE_URL`, somente quando houver backend separado;
- Resend e WhatsApp, opcionais e vazios por padrão.

Nunca versione `.env`, bancos SQLite, cookies, tokens ou credenciais.

## Limitações deliberadas

- demonstração de uma única propriedade, sem multitenancy;
- rate limiting em memória;
- sem pagamento de sinal;
- sem assinatura eletrônica;
- imagens ilustrativas, não fotografias de um espaço real;
- proposta PDF não substitui contrato jurídico revisado.

## Imagens

Somente imagens com origem documentada são usadas. Atribuições estão em [`public/gallery/README.md`](public/gallery/README.md). A licença das fotografias não concede licença sobre o código.

## Licença

Código proprietário. Consulte [`LICENSE`](LICENSE). Nenhuma permissão de reutilização, redistribuição ou exploração comercial é concedida sem autorização escrita.
