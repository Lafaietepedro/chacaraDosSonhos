# Venue Eventos

Venue Eventos é uma aplicação web para operação de espaços de eventos: vitrine pública, solicitação de reserva, validação de disponibilidade, calendário administrativo, gestão de pacotes e acompanhamento de contatos.

O projeto começou como um site específico para uma propriedade, mas foi reposicionado como um produto reaproveitável para salões, chácaras, áreas de lazer e pequenas operações que precisam sair de planilhas, mensagens soltas e controle manual de agenda.

## Case

### Problema

Operadores de espaços de eventos normalmente recebem pedidos por WhatsApp, calculam valores manualmente e verificam a agenda em ferramentas separadas. Isso cria três riscos recorrentes:

- Reserva duplicada para a mesma data.
- Preço inconsistente entre pacotes, taxas e convidados extras.
- Falta de histórico centralizado de contatos, pedidos e decisões.

### Solução

O Venue Eventos centraliza o fluxo mínimo de operação:

- Página pública para apresentar o espaço, pacotes e canais de contato.
- Formulário de reserva em etapas, com pacote, data, convidados e dados do cliente.
- Regra de preço isolada em serviço testável.
- Validação de disponibilidade no backend antes de criar reservas.
- Dashboard para aprovar, recusar, cancelar, concluir e excluir reservas.
- Bloqueio manual de datas no calendário administrativo.
- Configuração editável de propriedade, taxa operacional e pacotes.

### Resultado Atual

O projeto já está em nível apresentável para portfólio técnico: tem domínio claro, regras de negócio fora da UI, persistência real, autenticação administrativa, dashboard funcional, testes automatizados e build de produção validado.

Ainda não é um SaaS pronto para clientes pagantes. Os principais pontos antes de produção real são deploy com PostgreSQL, gestão de fotos, pagamento de sinal e melhoria visual final do dashboard.

## Stack

- Next.js 16 com App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite em desenvolvimento
- Schema alternativo para PostgreSQL
- API routes do próprio Next.js
- ESLint 9 flat config
- Node 24 recomendado
- Testes com `node:test`

Node 25 é uma release Current e apresentou instabilidade na geração do Prisma Client neste ambiente. Para desenvolvimento e build, use Node 24.

## Funcionalidades

### Público

- Página responsiva com hero, proposta de valor, galeria demonstrativa, pacotes, FAQ e contato.
- Catálogo público carregado do banco, com fallback inicial de configuração.
- Formulário de contato persistido no banco.
- Solicitação de reserva em 3 etapas.
- Cálculo automático de pacote, taxa operacional e convidados extras.
- Rate limiting em memória nos endpoints públicos.
- Notificação opcional por email via Resend.
- Notificação opcional por WhatsApp via webhook ou CallMeBot.

### Administrativo

- Login administrativo.
- Usuário administrador persistido no banco.
- Senha com hash usando `scrypt`.
- Sessão assinada por HMAC.
- Dashboard com indicadores de reservas, receita mensal e ocupação.
- Lista paginada de reservas com filtros.
- Detalhes de reserva.
- Transições de status validadas no backend.
- Calendário com reservas e bloqueios.
- Bloqueios de data persistidos.
- Gestão de mensagens de contato.
- Configuração do espaço: nome, descrição, capacidade, taxa, contato e endereço.
- Gestão de pacotes: preço, duração, capacidade, convidado extra, itens incluídos, destaque, ordem e ativação.
- Troca de senha pelo painel.

## Decisões Técnicas

### Next.js Como Aplicação Full Stack

O projeto permanece em Next.js porque ainda é uma operação de escopo concentrado. Separar backend agora adicionaria deploy, autenticação entre serviços e duplicação operacional sem ganho proporcional.

As API routes são suficientes para o estágio atual, desde que regras críticas fiquem em `lib/services`.

### Prisma Como Camada de Persistência

O Prisma mantém o modelo de dados explícito e facilita a migração futura para PostgreSQL. SQLite é mantido para desenvolvimento local, mas não deve ser o banco final de demonstração pública.

### Regras de Negócio em Serviços

Preço, disponibilidade, criação de reserva e transições de status ficam fora dos componentes React. Isso reduz acoplamento e permite testes rápidos sem subir a aplicação inteira.

### Snapshots de Pacote

Reservas gravam nome, preço base, taxa operacional e valor por convidado extra no momento da criação. Assim, alterações futuras em pacotes não corrompem o histórico financeiro.

## Arquitetura

```txt
app/
  api/                         Rotas de autenticação, catálogo, contato, reservas e dashboard
  booking/                     Fluxo público de solicitação de reserva
  dashboard/                   Painel administrativo
  page.tsx                     Página pública
components/
  auth/                        Login administrativo
  ui/                          Componentes base
  *.tsx                        Seções públicas, calendário e partes do dashboard
lib/
  services/
    availability.ts            Regra de disponibilidade
    booking.service.ts         Criação transacional de reserva
    booking-status.ts          Fluxo permitido de status
    notification.service.ts    Email transacional opcional
    pricing.ts                 Cálculo de preço
    property.service.ts        Bootstrap e consulta da propriedade padrão
  api-auth.ts                  Validação de sessão administrativa
  auth-crypto.ts               Hash de senha e assinatura
  catalog.ts                   Catálogo público
  prisma.ts                    Cliente Prisma
  rate-limit.ts                Rate limit em memória
  site.ts                      Fallback de marca e seed inicial
prisma/
  schema.prisma                Schema local com SQLite
  schema-production.prisma     Referência para PostgreSQL
  seed.js                      Seed idempotente
tests/
  availability.test.ts
  booking-status.test.ts
  pricing.test.ts
  rate-limit.test.ts
```

## Qualidade

Cobertura automatizada atual:

- Cálculo de preço.
- Rate limiting.
- Disponibilidade de datas.
- Transições de status de reserva.

Checks usados durante o desenvolvimento:

```bash
npm test
npm run lint
./node_modules/.bin/tsc --noEmit
npm audit
npx -p node@24 npm run build
```

Último estado validado: testes, lint, TypeScript, audit e build de produção passando.

## Como Rodar

Instale dependências:

```bash
npm install
```

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
```

Configure `.env` ou `.env.local`:

```env
DATABASE_URL="file:./dev.db"
DASHBOARD_USERNAME="admin"
DASHBOARD_PASSWORD="troque-esta-senha"
AUTH_SECRET="gere-uma-string-longa-e-aleatoria"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Venue Eventos <reservas@seudominio.com.br>"
WHATSAPP_PHONE="5561999999999"
WHATSAPP_WEBHOOK_URL=""
CALLMEBOT_API_KEY=""
```

Prepare o banco:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Rode em desenvolvimento:

```bash
npm run dev
```

A aplicação abre em `http://localhost:3000`.

Rode validações:

```bash
npm test
npm run lint
npm run build
```

Se estiver usando Node 25 e o Prisma Client não gerar corretamente, execute os comandos com Node 24:

```bash
npx -p node@24 npm run build
```

## Deploy Recomendado

Para uma demonstração pública de portfólio:

- Vercel para aplicação Next.js.
- Supabase, Neon ou Railway para PostgreSQL.
- `schema-production.prisma` como base da migração.
- `AUTH_SECRET` obrigatório em produção.
- Seed inicial rodado uma vez no ambiente remoto.

SQLite local é aceitável para desenvolvimento, mas é um ponto fraco para demo pública porque não resolve concorrência real e não representa uma operação em produção.

## Trade-Offs

- Autenticação customizada mantém o projeto simples, mas NextAuth/Auth.js pode fazer sentido quando houver múltiplos administradores, recuperação de senha e sessões mais robustas.
- Rate limiting em memória funciona para desenvolvimento e deploy simples, mas deve virar Upstash Redis ou alternativa persistente em produção serverless.
- Email via Resend está pronto como integração opcional, mas o projeto ainda não mantém histórico de envio.
- Não há multitenancy. A decisão é intencional: primeiro consolidar uma operação bem feita, depois generalizar para múltiplas propriedades.
- Não há pagamento de sinal. Mercado Pago é provavelmente a melhor próxima escolha para o mercado brasileiro.

## Roadmap

Prioridade alta:

- Deploy público com PostgreSQL.
- Polimento visual final do dashboard.
- Upload e ordenação de fotos.
- Histórico de notificações.
- Testes para criação de reserva com transação e snapshots.

Prioridade média:

- Pagamento de sinal via Mercado Pago.
- Contrato PDF gerado sob demanda.
- Exportação de agenda.
- Relatórios de receita, ocupação, conversão e ticket médio.
- Gestão de múltiplos administradores.

Prioridade futura:

- Assinatura eletrônica.
- WhatsApp Business API oficial.
- Motor de preços por temporada, feriado e regras customizadas.
- Multiunidade ou multitenancy.
- Auditoria e permissões granulares.

## Prompt Para Segunda Opinião

Use este prompt para pedir uma avaliação crítica a outro assistente:

```txt
Analise este projeto como se fosse um produto real chamado Venue Eventos.

Contexto: ele começou como um site específico para aluguel de uma propriedade, mas foi renomeado e reposicionado para virar uma base profissional de gestão de reservas para espaços de eventos. Quero remover qualquer traço de projeto pessoal antigo e decidir se vale manter esta arquitetura ou fazer uma refatoração maior.

Stack atual:
- Next.js 16 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- SQLite em desenvolvimento
- Schema alternativo para PostgreSQL
- API routes do Next.js
- Autenticação administrativa com senha hasheada por scrypt e sessão assinada por HMAC
- Testes com node:test

Funcionalidades implementadas:
- Página pública com seções comerciais.
- Fluxo de solicitação de reserva.
- Cálculo de preço por pacote, taxa operacional e convidados extras.
- Persistência de reservas com Prisma.
- Validação de disponibilidade no backend.
- Datas bloqueadas persistidas.
- Pacotes e configurações do espaço editáveis pelo painel.
- Email transacional opcional para cliente e anfitrião via Resend.
- Dashboard com login, estatísticas, paginação, filtros, detalhes, aprovação, recusa, cancelamento, conclusão e exclusão.
- Calendário visual.
- Testes para preço, disponibilidade, rate limit e transições de status.

Funcionalidades desejadas:
- Deploy público com PostgreSQL.
- Pagamento de sinal via PIX/cartão.
- Gestão real de fotos.
- Contrato PDF.
- Gestão de múltiplos administradores.
- Relatórios melhores.
- Histórico de notificações.
- Refresh token, rotação de sessão e permissões granulares.
- Possível multiunidade ou multitenancy no futuro.

Quero que você proponha:
1. Uma estratégia de refatoração realista em fases.
2. O que deve ser mantido, removido ou reescrito.
3. O modelo de dados ideal para reservas, propriedades, pacotes, bloqueios, pagamentos e contratos.
4. A arquitetura recomendada para continuar em Next.js ou separar backend.
5. Riscos técnicos e pontos frágeis do projeto atual.
6. Um plano de implementação com prioridades para transformar isso em produto profissional.

Seja crítico, mas pragmático. Não proponha uma reescrita total se uma refatoração incremental resolver melhor.
```
