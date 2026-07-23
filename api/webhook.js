const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const airtable = require('airtable');

// Configurar Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  console.log('✅ Pago completado:', paymentIntent.id);
  console.log('Monto:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());
  
  const metadata = paymentIntent.metadata;
  
  if (metadata.petId && metadata.serviceType) {
    try {
      // Actualizar registro en Airtable
      const petRecord = await base('Mascotas').find(metadata.petId);
      
      // Generar código QR único para la transacción
      const qrData = {
        petId: metadata.petId,
        service: metadata.serviceType,
        stripePaymentId: paymentIntent.id,
        timestamp: new Date().toISOString(),
        amount: paymentIntent.amount / 100
      };
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      
      // Crear registro de servicio en Airtable
      const serviceRecord = await base('Servicios').create({
        'ID Mascota': [metadata.petId],
        'Tipo de Servicio': metadata.serviceType,
        'Estado del Pago': 'Completado',
        'ID Stripe': paymentIntent.id,
        'Código QR': [{ url: qrCode }],
        'Monto': paymentIntent.amount / 100,
        'Moneda': paymentIntent.currency.toUpperCase(),
        'Fecha': new Date().toISOString(),
        'Metadata': JSON.stringify(metadata)
      });
      
      console.log('✅ Servicio registrado en Airtable:', serviceRecord.id);
    } catch (err) {
      console.error('Error actualizando Airtable:', err);
    }
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Pago fallido:', paymentIntent.id);
  console.log('Razón:', paymentIntent.last_payment_error?.message);
  
  const metadata = paymentIntent.metadata;
  
  if (metadata.petId) {
    try {
      await base('Servicios').create({
        'ID Mascota': [metadata.petId],
        'Tipo de Servicio': metadata.serviceType || 'Desconocido',
        'Estado del Pago': 'Fallido',
        'ID Stripe': paymentIntent.id,
        'Error': paymentIntent.last_payment_error?.message,
        'Fecha': new Date().toISOString()
      });
    } catch (err) {
      console.error('Error registrando pago fallido:', err);
    }
  }
}

async function handleRefund(charge) {
  console.log('💰 Reembolso procesado:', charge.id);
  console.log('Monto reembolsado:', charge.amount_refunded / 100, charge.currency.toUpperCase());
  
  // Actualizar estado en Airtable
  try {
    const records = await base('Servicios').select({
      filterByFormula: `{ID Stripe} = '${charge.id}'`
    }).firstPage();
    
    if (records.length > 0) {
      await base('Servicios').update(records[0].id, {
        'Estado del Pago': 'Reembolsado',
        'Monto Reembolsado': charge.amount_refunded / 100
      });
      console.log('✅ Servicio actualizado a reembolsado');
    }
  } catch (err) {
    console.error('Error actualizando reembolso:', err);
  }
}
