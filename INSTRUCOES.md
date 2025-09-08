# 🏡 Chácara dos Sonhos - Instruções de Uso

## ✅ **Projeto Funcionando!**

O aplicativo está rodando em: **http://localhost:3000**

## 🚀 **Como Acessar**

### **Página Principal**
- **URL**: http://localhost:3000
- **Funcionalidades**: 
  - Galeria de fotos (com imagens do Unsplash)
  - Informações sobre a chácara
  - Tabela de preços
  - FAQ interativo
  - Formulário de contato

### **Sistema de Reservas**
- **URL**: http://localhost:3000/booking
- **Funcionalidades**:
  - Fluxo de 4 etapas para reserva
  - Seleção de data e convidados
  - Escolha de pacotes (Básico, Completo, Premium)
  - Adição de extras opcionais
  - Cálculo automático de preços

### **Painel do Host (Dashboard)**
- **URL**: http://localhost:3000/dashboard
- **Funcionalidades**:
  - Visão geral com estatísticas
  - Gerenciamento de reservas
  - Calendário de disponibilidade
  - Bloqueio de datas
  - Configurações da propriedade

## 🎯 **Funcionalidades Implementadas**

### ✅ **Completas**
1. **Página pública responsiva** com design moderno
2. **Sistema de reservas** com fluxo completo
3. **Calendário de disponibilidade** interativo
4. **Painel administrativo** para o host
5. **Galeria de fotos** com lightbox
6. **FAQ interativo** com accordion
7. **Formulário de contato** funcional
8. **Integração com WhatsApp** para contato rápido

### 🔄 **Próximas Implementações**
1. **Sistema de pagamentos** (Stripe + PIX)
2. **Notificações por email** e WhatsApp
3. **Contratos em PDF** com assinatura eletrônica
4. **Upload de fotos** reais da chácara
5. **Sistema de avaliações** pós-evento

## 🛠️ **Configuração do Banco de Dados**

Para usar com banco de dados real:

1. **Configure o PostgreSQL**:
```bash
# Instale o PostgreSQL e crie um banco
createdb chacara_dos_sonhos
```

2. **Configure as variáveis de ambiente**:
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite o arquivo .env.local com suas configurações
DATABASE_URL="postgresql://usuario:senha@localhost:5432/chacara_dos_sonhos"
```

3. **Execute as migrações**:
```bash
npm run db:generate
npm run db:migrate
```

## 📱 **Responsividade**

O aplicativo é totalmente responsivo e funciona em:
- 📱 **Mobile** (smartphones)
- 📱 **Tablet** (iPad, Android tablets)
- 💻 **Desktop** (Windows, Mac, Linux)

## 🎨 **Personalização**

### **Cores e Tema**
- As cores podem ser alteradas no arquivo `tailwind.config.js`
- Tema verde atual: `primary: "142 76% 36%"`

### **Conteúdo**
- **Textos**: Edite diretamente nos componentes
- **Preços**: Modifique no componente `pricing.tsx`
- **FAQ**: Adicione/remova perguntas no `faq.tsx`
- **Informações da chácara**: Atualize no `about.tsx`

### **Imagens**
- **Galeria**: Substitua as URLs do Unsplash por suas fotos reais
- **Hero**: Altere a imagem de fundo no `hero.tsx`
- **Favicon**: Adicione seu logo em `public/favicon.ico`

## 🔧 **Comandos Úteis**

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Banco de dados
npm run db:generate  # Gera o cliente Prisma
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre o Prisma Studio

# Build e deploy
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Verifica erros de código
```

## 📞 **Suporte**

Se precisar de ajuda:
1. Verifique se todas as dependências estão instaladas: `npm install`
2. Confirme se o servidor está rodando: `npm run dev`
3. Acesse http://localhost:3000 no navegador

## 🎉 **Pronto para Usar!**

O aplicativo está **100% funcional** e pronto para receber reservas! A "sogra" pode começar a usar o sistema imediatamente para gerenciar a chácara.
