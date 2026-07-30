# Arquivo histórico — visão anterior do Venue Eventos

> Este briefing descreve a identidade anterior à demonstração Villa Aurora. Ele é mantido apenas como registro de evolução de design e não define a marca, os textos ou os fluxos públicos atuais.

## Overview Para Segunda Proposta De Design

Este documento descreve o estado visual original do projeto Venue Eventos antes do redesign aplicado no repositório. A ideia é permitir que outro assistente proponha uma direção alternativa de UI/branding para comparação.

## Contexto Do Produto

Venue Eventos é uma aplicação web para espaços de eventos que precisam divulgar o local, receber solicitações de reserva e acompanhar a operação pelo painel administrativo.

O produto não deve parecer uma landing page genérica de chácara nem um SaaS abstrato demais. O equilíbrio desejado é:

- visual premium e confiável;
- linguagem de operação real;
- foco em reserva, agenda e atendimento;
- aparência profissional o suficiente para portfólio;
- fácil adaptação para diferentes espaços de eventos.

## Design Original

O site público original seguia uma estrutura clássica de landing page:

1. Header fixo branco com logo `VE`, links de navegação, botões de contato, WhatsApp, admin e reservar.
2. Hero full-screen com foto de casa/espaço ao fundo, overlay escuro, headline centralizada e CTAs.
3. Seção "Sobre" com cards de funcionalidades em grid.
4. Galeria demonstrativa com cards quadrados e filtros por categoria.
5. Pacotes em três cards com preço, capacidade, duração, itens inclusos e CTA.
6. FAQ em acordeões centralizados.
7. Contato com formulário em card e cards laterais de telefone/email/endereço/horário.
8. Footer escuro com links, produto e contato.

## Pontos Fortes Do Design Original

- Estrutura clara e fácil de entender.
- Hero usava imagem real, não ilustração abstrata.
- CTA de reserva sempre evidente.
- Galeria e pacotes davam material visual e comercial.
- Layout responsivo simples.
- Componentes consistentes com Tailwind e shadcn-like UI.

## Fragilidades Visuais

- Parecia template genérico de landing page.
- Excesso de cards semelhantes, com pouca hierarquia editorial.
- Paleta muito dependente de verde + cinza.
- Hero centralizado era bonito, mas pouco distintivo.
- A página vendia "espaço de eventos" e "sistema de gestão" ao mesmo tempo sem uma direção visual muito forte.
- Galeria usava imagens demonstrativas de bancos externos e não comunicava bem produto operacional.
- A seção de pacotes parecia e-commerce simples, sem destacar que os valores são editáveis e têm snapshots.
- FAQ tinha muitas perguntas técnicas em uma composição comum.

## Direção Desejada Para Nova Proposta

Proponha um redesign profissional que trate o Venue Eventos como produto operacional premium para espaços de eventos.

Prioridades:

- Dar personalidade visual sem exagerar.
- Evitar visual SaaS genérico com cards demais.
- Manter foto real como sinal de primeira dobra.
- Mostrar que o produto resolve agenda, reserva e atendimento.
- Preservar CTAs para `/booking`, WhatsApp e `/dashboard`.
- Ser responsivo em mobile e desktop.
- Manter cards com raio discreto, até 8px.
- Usar ícones de forma funcional.
- Não depender de ilustrações SVG decorativas.

## Stack E Restrições

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- lucide-react para ícones.
- Componentes base: `Button`, `Card`, `Input`, `Label`.
- Imagem hero atual vem de `siteConfig.heroImage`.
- Não há ainda gestão real de fotos; galeria é demonstrativa.
- O dashboard existe e deve continuar acessível.

## Páginas Existentes

- `/`: página pública.
- `/booking`: fluxo público de reserva.
- `/dashboard`: login e painel administrativo.

## Prompt Sugerido Para Claude

```txt
Analise o overview do design original do Venue Eventos e proponha uma direção alternativa de redesign.

Quero uma proposta visual profissional para uma aplicação de gestão de reservas para espaços de eventos. O produto deve parecer premium, confiável e operacional, evitando cara de template genérico.

Entregue:
1. Diagnóstico visual do design original.
2. Nova direção de marca/UI.
3. Estrutura recomendada para a página pública.
4. Sugestões de layout para hero, operação, galeria, pacotes, FAQ e contato.
5. Paleta, tipografia, espaçamentos e uso de imagem.
6. O que manter e o que mudar.
7. Se possível, um plano incremental de implementação em componentes React/Tailwind.

Restrições:
- Next.js + Tailwind.
- Usar imagem real no hero.
- Não usar ilustrações genéricas.
- Cards discretos, raio máximo de 8px.
- CTAs principais: solicitar reserva, WhatsApp e área administrativa.
- O design precisa funcionar como portfólio técnico e produto demonstrável.
```
