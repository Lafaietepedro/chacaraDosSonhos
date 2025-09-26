type WhatsAppPayload = {
  phone: string
  message: string
}

export async function notifyWhatsAppHost(message: string): Promise<void> {
  try {
    const phone = process.env.WHATSAPP_PHONE?.replace(/\D/g, '')
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL

    if (!phone) {
      console.warn('WHATSAPP_PHONE not configured; skipping WhatsApp notification')
      return
    }

    // If a webhook is configured (e.g., your middleware that sends WhatsApp), call it
    if (webhookUrl) {
      const payload: WhatsAppPayload = { phone, message }
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })
      return
    }

    // Fallback: try CallMeBot (unofficial). Requires CALLMEBOT_API_KEY
    const callMeBotKey = process.env.CALLMEBOT_API_KEY
    if (callMeBotKey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        phone
      )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(callMeBotKey)}`
      await fetch(url, { method: 'GET', cache: 'no-store' })
      return
    }

    console.warn('No WhatsApp provider configured; set WHATSAPP_WEBHOOK_URL or CALLMEBOT_API_KEY')
  } catch (err) {
    console.error('Failed to send WhatsApp notification', err)
  }
}


