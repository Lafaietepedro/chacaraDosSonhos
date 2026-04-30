# Venue Eventos

Venue Eventos é uma base web para operadores de espaços de eventos que precisam divulgar o local, receber solicitações de reserva e acompanhar a agenda pelo painel administrativo.

O projeto nasceu como uma página específica de uma propriedade, mas foi reposicionado para não depender de nomes, pessoas ou contexto anterior. A direção recomendada agora é tratar o código como um produto reaproveitável para salões, espaços ao ar livre, áreas de lazer e pequenas operações de eventos.

## Estado Atual

Stack real do repositório:

- Next.js 14 com App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite local em desenvolvimento
- API routes do próprio Next.js
- Autenticação administrativa com `AdminUser`, senha hasheada por `scrypt` e token assinado por HMAC
- Helper de notificação por WhatsApp via webhook ou CallMeBot
- Node 24 LTS recomendado. Node 25 é uma release Current e apresentou falha silenciosa ao gerar Prisma Client neste ambiente.

Funcionalidades que existem hoje:

- Página pública responsiva com hero, proposta de valor, galeria demonstrativa, pacotes, FAQ e contato.
- Fluxo de solicitação de reserva em 3 etapas: data/convidados, pacote e dados do cliente.
- Cálculo automático de valor com pacote, taxa operacional e convidados extras.
- Persistência de reservas no Prisma.
- Criação automática de usuário cliente e propriedade padrão quando necessário.
- Catálogo de pacotes persistido no banco via modelo `BookingPackage`, com fallback inicial a partir de `lib/site.ts`.
- Snapshot de pacote e preço gravado na reserva.
- Validação de disponibilidade no backend para impedir reserva em data bloqueada ou já pendente/confirmada.
- Bloqueios de data persistidos no banco e conectados ao calendário do dashboard.
- Painel administrativo com login, indicadores básicos, lista de reservas, detalhes, aprovação, recusa e exclusão.
- Calendário visual no dashboard com reservas pendentes/confirmadas e bloqueios persistidos.
- Configurações básicas do espaço editáveis no dashboard: nome, descrição, capacidade, taxa operacional, contato e endereço.
- Pacotes editáveis no dashboard: nome, preço, duração, capacidade, valor por convidado extra, itens incluídos, destaque e ativação.
- Usuário administrativo persistido no banco, com bootstrap inicial por variáveis de ambiente e troca de senha pelo painel.
- Configuração centralizada de marca/contato em `lib/site.ts`, usada como fallback e seed inicial.

## Diferença Para o README Antigo

O README antigo descrevia uma visão maior do que o código implementado. Estes pontos ainda não estão prontos para produção:

- Pagamento online com Stripe, PIX ou PayPal.
- Cobrança de sinal integrada ao fluxo.
- Emissão de recibo ou fatura.
- Envio real de email transacional.
- WhatsApp Business API oficial.
- Geração de contrato PDF.
- Assinatura eletrônica.
- Upload e gestão de fotos.
- Reviews pós-evento.
- Relatórios avançados.
- Multiunidade/multitenancy.
- Backend Express separado.
- PostgreSQL como banco padrão local.
- Refresh token, gestão de múltiplos administradores e papéis/permissões granulares.

## Viabilidade Das Funcionalidades

Alta viabilidade:

- Enviar emails com Resend, SendGrid ou outro provedor.
- Melhorar dashboard com filtros e busca.
- Criar páginas de termos, privacidade e contrato base.

Viabilidade média:

- Pagamento de sinal por Stripe Checkout ou Mercado Pago.
- PIX com confirmação por webhook.
- Geração de PDF com dados da reserva.
- Upload de fotos com Cloudinary ou Supabase Storage.
- Exportação para Google Calendar.
- Relatórios mensais de receita e ocupação.

Maior complexidade:

- Assinatura eletrônica com validade jurídica forte.
- WhatsApp Business API oficial.
- SaaS multitenant com várias propriedades e usuários.
- Motor de precificação por temporada, feriados e regras customizadas.
- Auditoria, logs e permissões granulares.

## Como Rodar

Instale dependências:

```bash
npm install
```

Configure variáveis de ambiente em `.env` ou `.env.local`:

```env
DATABASE_URL="file:./dev.db"
DASHBOARD_USERNAME="admin"
DASHBOARD_PASSWORD="troque-esta-senha"
AUTH_SECRET="gere-uma-string-longa-e-aleatoria"
WHATSAPP_PHONE="5561999999999"
WHATSAPP_WEBHOOK_URL=""
CALLMEBOT_API_KEY=""
```

Na primeira autenticação, o app cria um registro em `admin_users` usando `DASHBOARD_USERNAME` e `DASHBOARD_PASSWORD`. Depois disso, a senha passa a ser validada pelo hash salvo no banco. Em produção, defina sempre `AUTH_SECRET`; em desenvolvimento há fallback apenas para facilitar testes locais.

Prepare o Prisma:

```bash
npm run db:generate
npm run db:push
```

Se estiver usando Node 25 e o Prisma Client não regenerar, use Node 24 LTS para os comandos Prisma:

```bash
npx -p node@24 node ./node_modules/prisma/build/index.js generate --schema=prisma/schema.prisma
npx -p node@24 node ./node_modules/prisma/build/index.js db push --schema=prisma/schema.prisma
```

Rode em desenvolvimento:

```bash
npm run dev
```

A aplicação abre em `http://localhost:3000`.

## Estrutura Principal

```txt
app/
  api/                  Rotas de autenticação, dashboard e reservas
  api/catalog           Catálogo público de propriedade e pacotes
  api/dashboard/packages Pacotes editáveis pelo painel
  booking/              Fluxo público de solicitação de reserva
  dashboard/            Painel administrativo
  page.tsx              Página pública
components/
  auth/                 Login administrativo
  ui/                   Componentes base
  *.tsx                 Seções públicas e calendário
lib/
  site.ts               Marca, contato, pacotes e taxa operacional
  catalog.ts            Fallback de catálogo para a UI
  services/             Regras de negócio de reservas, preço e disponibilidade
  prisma.ts             Cliente Prisma
  notify.ts             Notificação WhatsApp
  auth.ts               Hook de autenticação client-side
  api-auth.ts           Validação do token administrativo assinado
prisma/
  schema.prisma         Schema SQLite local com pacotes e snapshots de reserva
  schema-production.prisma Schema alternativa para PostgreSQL
scripts/
  quick-bookings.js     Consulta rápida de reservas
  view-bookings.js      Consulta detalhada de reservas
```

## Direção Recomendada De Refatoração

Prioridade 1:

- Completar a remoção de `any` em telas administrativas futuras.
- Criar rotação de `AUTH_SECRET` e gestão de sessões ativas.
- Criar fluxo de seed/migration mais formal para ambientes novos.

Prioridade 2:

- Criar camada de serviço para reservas, separando regra de negócio das API routes.
- Criar testes para cálculo de preço, disponibilidade e transição de status.
- Adicionar email transacional para cliente e anfitrião.
- Adicionar filtros no dashboard por status, período e cliente.
- Melhorar tratamento de loading/erro nas telas.

Prioridade 3:

- Implementar pagamento de sinal.
- Gerar contrato PDF com dados da reserva.
- Adicionar upload e ordenação de fotos.
- Criar relatório mensal de receita, conversão e ocupação.
- Adicionar refresh token e permissões granulares quando houver mais de um administrador.

## Prompt Para Enviar Ao Claude

Use o texto abaixo para pedir uma segunda visão de refatoração:

```txt
Analise este projeto como se fosse um produto real chamado Venue Eventos.

Contexto: ele começou como um site específico para aluguel de uma propriedade, mas foi renomeado e reposicionado para virar uma base profissional de gestão de reservas para espaços de eventos. Quero remover qualquer traço de projeto pessoal antigo e decidir se vale manter esta arquitetura ou fazer uma refatoração maior.

Stack atual:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite em desenvolvimento
- API routes do Next.js
- Autenticação administrativa com senha hasheada e sessão assinada

Funcionalidades implementadas:
- Página pública com seções comerciais.
- Fluxo de solicitação de reserva.
- Cálculo de preço por pacote, taxa operacional e convidados extras.
- Persistência de reservas com Prisma.
- Validação de disponibilidade no backend.
- Datas bloqueadas persistidas.
- Pacotes e configurações do espaço editáveis pelo painel.
- Dashboard com login, estatísticas básicas, listagem, detalhes, aprovação, recusa e exclusão.
- Calendário visual.

Funcionalidades desejadas, mas ainda não implementadas:
- Pagamento de sinal via PIX/cartão.
- Gestão de múltiplos administradores.
- Gestão real de fotos.
- Email transacional.
- Contrato PDF.
- Assinatura eletrônica.
- Relatórios melhores.
- Refresh token, rotação de sessão e permissões granulares.
- Possível multiunidade/multitenancy no futuro.

Quero que você proponha:
1. Uma estratégia de refatoração realista em fases.
2. O que deve ser mantido, removido ou reescrito.
3. O modelo de dados ideal para reservas, propriedades, pacotes, bloqueios, pagamentos e contratos.
4. A arquitetura recomendada para continuar em Next.js ou separar backend.
5. Riscos técnicos e pontos frágeis do projeto atual.
6. Um plano de implementação com prioridades para transformar isso em produto profissional.

Seja crítico, mas pragmático. Não proponha uma reescrita total se uma refatoração incremental resolver melhor.
```
