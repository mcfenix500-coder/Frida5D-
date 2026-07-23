const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
  
  // Aquí puedes guardar la información del pago en tu base de datos
  // Por ejemplo: guardar orden, actualizar usuario, enviar email, etc.
  
  // Ejemplo:
  // await saveOrderToDatabase({
  //   stripePaymentId: paymentIntent.id,
  //   amount: paymentIntent.amount / 100,
  //   currency: paymentIntent.currency,
  //   status: 'completed',
  //   metadata: paymentIntent.metadata
  // });
}

async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Pago fallido:', paymentIntent.id);
  console.log('Razón:', paymentIntent.last_payment_error?.message);
  
  // Aquí puedes registrar el pago fallido
  // Por ejemplo: notificar al usuario, guardar intento fallido, etc.
  
  // Ejemplo:
  // await logFailedPayment({
  //   stripePaymentId: paymentIntent.id,
  //   errorMessage: paymentIntent.last_payment_error?.message,
  //   metadata: paymentIntent.metadata
  // });
}

async function handleRefund(charge) {
  console.log('💰 Reembolso procesado:', charge.id);
  console.log('Monto reembolsado:', charge.amount_refunded / 100, charge.currency.toUpperCase());
  
  // Aquí puedes registrar el reembolso
  // Por ejemplo: actualizar estado de orden, notificar usuario, etc.
  
  // Ejemplo:
  // await updateOrderStatus({
  //   stripePaymentId: charge.id,
  //   status: 'refunded',
  //   refundedAmount: charge.amount_refunded / 100
  // });
}
