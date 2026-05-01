# Modelo De Negócio Com Pacotes Customizáveis

## Ideia Central

O Venue Eventos pode evoluir de uma vitrine com pacotes fixos para um modelo híbrido:

- **Pacotes base**: planos prontos para comparação rápida e conversão simples.
- **Pacote sob medida**: orçamento guiado para eventos que fogem dos planos padrão.
- **Adicionais configuráveis**: módulos que aumentam ticket médio sem obrigar o operador a criar dezenas de pacotes.

Essa abordagem mantém a página objetiva para o cliente comum, mas abre espaço para eventos maiores, corporativos ou com necessidades especiais.

## Como Ficaria Para O Cliente

1. Cliente escolhe entre `Essencial`, `Celebração`, `Produção` ou `Sob medida`.
2. Se escolher um pacote fixo, o fluxo segue como hoje: data, convidados, pacote e contato.
3. Se escolher `Sob medida`, o fluxo adiciona perguntas guiadas:
   - tipo de evento;
   - faixa de convidados;
   - duração desejada;
   - áreas necessárias;
   - estrutura extra;
   - orçamento estimado;
   - observações.
4. O sistema gera uma **estimativa inicial**, mas marca como `Aguardando proposta`.
5. O anfitrião ajusta valores no dashboard e envia a proposta final.

## Estratégia Comercial

### Pacotes Base

Servem como âncoras de preço e reduzem atrito.

- Essencial: entrada acessível.
- Celebração: plano principal.
- Produção: evento maior, ticket mais alto.

### Pacote Sob Medida

Serve para capturar demanda que hoje iria para conversa manual.

Indicado para:

- eventos corporativos;
- casamentos;
- eventos com montagem prolongada;
- locação por mais de um dia;
- necessidade de fornecedores;
- uso parcial do espaço;
- eventos fora da capacidade padrão.

### Adicionais

Possíveis itens:

- horas extras;
- convidados extras;
- apoio operacional;
- decoração base;
- som/iluminação;
- limpeza reforçada;
- cozinha/área gourmet;
- mobiliário;
- segurança/portaria;
- day use de preparação;
- pós-evento/desmontagem.

## Modelo De Receita Do Produto

Se o Venue Eventos virar produto para outros operadores, a monetização pode combinar:

- **Assinatura mensal** por espaço ativo.
- **Setup inicial** para configurar marca, pacotes, fotos e domínio.
- **Módulo premium** para pacote sob medida e proposta comercial.
- **Taxa por pagamento processado** quando houver sinal online.
- **Plano Pro** com relatórios, multiusuário e integração de calendário.

## Impacto No Produto

Benefícios:

- aumenta ticket médio;
- reduz perda de leads complexos;
- posiciona o produto como ferramenta operacional, não só formulário;
- permite diferenciar planos de assinatura futuramente;
- cria caminho natural para contrato PDF e pagamento de sinal.

Riscos:

- fluxo pode ficar longo demais;
- estimativa automática pode parecer preço final;
- demanda mais cuidado no dashboard;
- modelo de dados precisa preservar histórico de adicionais e proposta.

Mitigação:

- manter pacotes fixos como caminho padrão;
- exibir `estimativa sujeita à confirmação`;
- salvar snapshots de todos os itens;
- separar solicitação de reserva e proposta final.

## Modelo De Dados Recomendado

```prisma
model PackageAddon {
  id          String   @id @default(cuid())
  propertyId  String
  name        String
  description String?
  price       Float
  unit        String   // hour, guest, fixed, day, item
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  property    Property @relation(fields: [propertyId], references: [id])
}

model CustomQuote {
  id              String   @id @default(cuid())
  bookingId       String   @unique
  eventType       String?
  desiredDuration String?
  budgetRange     String?
  requirements    String?
  estimatedAmount Float?
  finalAmount     Float?
  status          String   @default("DRAFT") // DRAFT, SENT, ACCEPTED, REJECTED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  booking         Booking  @relation(fields: [bookingId], references: [id])
  items           QuoteLineItem[]
}

model QuoteLineItem {
  id            String   @id @default(cuid())
  customQuoteId String
  label         String
  quantity      Float
  unit          String
  unitPrice     Float
  total         Float
  source        String?  // base_package, addon, manual
  createdAt     DateTime @default(now())

  customQuote   CustomQuote @relation(fields: [customQuoteId], references: [id])
}
```

## Mudanças No Fluxo

### Página Pública

- Card `Sob medida` na seção de pacotes apontando para `/booking?mode=custom`.
- CTA: `Montar proposta`.
- Explicar que é uma estimativa, não confirmação automática.

### Fluxo De Reserva

- Modo `Sob medida` com pacote base de referência.
- Campos iniciais para tipo de evento, duração desejada, faixa de investimento e necessidades principais.
- Resumo como estimativa, com aviso de que a proposta final pode variar.
- Briefing salvo em `notes` estruturado enquanto `CustomQuote` ainda não existe.

### Dashboard

- Aba de proposta dentro dos detalhes da reserva.
- Campos para ajustar valores manualmente.
- Status de proposta.
- Botão futuro para enviar email/WhatsApp com proposta.

## Prioridade Recomendada

1. Concluído: criar o card `Sob medida` na vitrine apontando para o fluxo atual com observações.
2. Concluído: adicionar `notes` estruturado no booking para capturar necessidades especiais.
3. Criar `PackageAddon` e adicionar adicionais editáveis.
4. Criar `CustomQuote` e `QuoteLineItem`.
5. Gerar proposta PDF.
6. Conectar pagamento de sinal.

## Decisão Recomendada

Compensa adicionar pacotes customizáveis, mas em fases. Para portfólio, o ideal é mostrar a visão de produto e talvez uma primeira UI de `Sob medida`; para produção real, só vale automatizar preço customizado depois que houver regras comerciais bem definidas.
