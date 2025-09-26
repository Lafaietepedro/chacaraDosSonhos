type WhatsAppPayload = {
  phone: string
  message: string
}

export async function notifyWhatsAppHost(message: string): Promise<boolean> {
  try {
    const phone = process.env.WHATSAPP_PHONE?.replace(/\D/g, '')
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL

    if (!phone) {
      console.warn('WHATSAPP_PHONE not configured; skipping WhatsApp notification')
      return false
    }

    console.log(`📱 Tentando enviar WhatsApp para: ${phone}`)

    // Opção 1: Webhook personalizado (recomendado para produção)
    if (webhookUrl) {
      try {
        const payload: WhatsAppPayload = { phone, message }
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        })

        if (response.ok) {
          console.log('✅ WhatsApp enviado via webhook')
          return true
        } else {
          console.error('❌ Erro no webhook WhatsApp:', response.status)
          return false
        }
      } catch (error) {
        console.error('❌ Erro ao chamar webhook WhatsApp:', error)
        return false
      }
    }

    // Opção 2: CallMeBot (grátis, requer configuração)
    const callMeBotKey = process.env.CALLMEBOT_API_KEY
    if (callMeBotKey) {
      try {
        const callMebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
          phone
        )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(callMeBotKey)}`
        
        const response = await fetch(callMebotUrl, { 
          method: 'GET', 
          cache: 'no-store' 
        })
        
        if (response.ok) {
          console.log('✅ WhatsApp enviado via CallMeBot')
          return true
        } else {
          console.error('❌ Erro CallMeBot:', response.status)
          return false
        }
      } catch (error) {
        console.error('❌ Erro ao usar CallMeBot:', error)
        return false
      }
    }

    console.warn('⚠️ Nenhuma configuração do WhatsApp encontrada!')
    console.warn('Configure WHATSAPP_PHONE + WHATSAPP_WEBHOOK_URL ou CALLMEBOT_API_KEY')
    return false
  } catch (err) {
    console.error('❌ Falha geral ao enviar WhatsApp:', err)
    return false
  }
}


