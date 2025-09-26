# 🤳 Configuração WhatsApp para Notificações

Para receber notificações automáticas no WhatsApp quando uma nova reserva for efetuada:

## 📋 Método 1: CallMeBot (Recomendado - Grátis)

### Passo 1: Configurar CallMeBot
1. Acesse: [api.callmebot.com](https://api.callmebot.com/whatsapp.php)
2. Clique em "Set up" e adicione o número do WhatsApp
3. Anote a API KEY gerada

### Passo 2: Configurar no projeto
```env
# Em .env.local
WHATSAPP_PHONE="+5511999999999"
CALLMEBOT_API_KEY="sua_api_key_aqui"
```

### Passo 3: Teste
- Faça uma reserva no site
- Verifique se a proprietária recebeu a mensagem

## 🏢 Método 2: WhatsApp Business API (Produção)

Para ambiente profissional, use um webhook próprio:

```env
# Em .env.local
WHATSAPP_PHONE="+5511999999999"
WHATSAPP_WEBHOOK_URL="https://sua-api.com/send-message"
```

## 📱 Como Funciona

Quando uma nova reserva é feita:
1. ✅ Reserva é salva no banco de dados
2. 📲 Sistema envia WhatsApp com:
   - Dados do cliente
   - Data da reserva
   - Número de convidados
   - Valor total
   - Observações
3. 👩‍💼 Proprietária recebe instantâneamente

## ⚡ Exemplo da mensagem enviada:

```
🏡 Nova reserva - Espaço Vip JR

📅 Data: 15/12/2024
👥 Convidados: 50
💰 Valor: R$ 950,00
📦 Pacote: básico
👤 Cliente: João Silva
📱 Telefone: (11) 99999-9999
📧 Email: joao@email.com
📝 Observações: Preciso de estrutura de som especial

Reserva criada no sistema!
```

## 🔧 Troubleshooting

### Não recebeu mensagem?
1. Verifique o número do telefone no `.env.local`
2. Confirme se as chaves API estão corretas
3. Teste manualmente a API
4. Verifique logs no terminal

### Logs importantes:
```
📱 Tentando enviar WhatsApp para: +5511999999999
✅ WhatsApp enviado via CallMeBot
```

### Mensagens de erro:
```
❌ Configure WHATSAPP_PHONE + WHATSAPP_WEBHOOK_URL ou CALLMEBOT_API_KEY
```
→ Adicione as configurações necessárias no arquivo `.env.local`
