// Cliente de webhooks listo para conectar con n8n.
//
// Para producción define las variables de entorno:
//   NEXT_PUBLIC_IC_N8N_BOOKING_WEBHOOK -> reservas del panel cliente
//   NEXT_PUBLIC_N8N_BROADCAST_WEBHOOK -> difusión masiva geográfica del admin
//
// Si no hay URL configurada, se simula la llamada localmente (modo demo).

export type WebhookResult = {
  ok: boolean
  simulated: boolean
  id: string
  message: string
}

async function post(url: string | undefined, payload: Record<string, unknown>): Promise<WebhookResult> {
  const id = `wh_${Math.random().toString(36).slice(2, 10)}`
  const body = { ...payload, dispatchId: id, source: 'frida5d-app', sentAt: new Date().toISOString() }

  // Modo demo: sin URL configurada simulamos el envío.
  if (!url) {
    console.log('[v0] Webhook simulado (n8n no configurado):', body)
    await new Promise((r) => setTimeout(r, 1200))
    return { ok: true, simulated: true, id, message: 'Webhook simulado enviado a n8n (modo demo).' }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    console.log('[v0] Webhook n8n enviado:', res.status)
    return {
      ok: res.ok,
      simulated: false,
      id,
      message: res.ok ? 'Webhook enviado a n8n correctamente.' : `n8n respondió con estatus ${res.status}.`,
    }
  } catch (err) {
    console.log('[v0] Error enviando webhook:', (err as Error).message)
    return { ok: false, simulated: false, id, message: 'No se pudo contactar el webhook de n8n.' }
  }
}

export function sendBookingWebhook(payload: Record<string, unknown>) {
  return post(process.env.NEXT_PUBLIC_IC_N8N_BOOKING_WEBHOOK, { event: 'booking.created', ...payload })
}

export function sendBroadcastWebhook(payload: Record<string, unknown>) {
  return post(process.env.NEXT_PUBLIC_N8N_BROADCAST_WEBHOOK, { event: 'broadcast.launch', ...payload })
}

// Registro de terapeutas: usa el mismo webhook de producción de n8n.
export function sendTherapistSignupWebhook(payload: Record<string, unknown>) {
  return post(process.env.NEXT_PUBLIC_IC_N8N_BOOKING_WEBHOOK, { event: 'therapist.signup', ...payload })
}
