const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const airtable = require('airtable');

// Configurar Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

/**
 * Crear sesión de pago Stripe
 * POST /api/payment?action=create-session
 */
export async function createPaymentSession(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { petId, serviceType, amount, currency = 'MXN', description } = req.body;

    if (!petId || !serviceType || !amount) {
      return res.status(400).json({
        error: 'petId, serviceType y amount son requeridos'
      });
    }

    // Validar monto mínimo (1 unidad de moneda = 100 en centavos)
    if (amount < 0.01) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0.01' });
    }

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${serviceType} - Servicio de Bienestar`,
              description: description || `Servicio de ${serviceType} para mascota`,
              metadata: {
                petId,
                serviceType
              }
            },
            unit_amount: Math.round(amount * 100) // Convertir a centavos
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/cancel`,
      metadata: {
        petId,
        serviceType,
        description: description || ''
      },
      // Información del cliente para autocompletar
      billing_address_collection: 'auto',
      customer_creation: 'always'
    });

    // Crear registro preliminar en Airtable
    const serviceRecord = await base('Servicios').create({
      'ID Mascota': [petId],
      'Tipo de Servicio': serviceType,
      'Estado del Pago': 'Pendiente',
      'ID Stripe': session.payment_intent || session.id,
      'Monto': amount,
      'Moneda': currency,
      'Fecha': new Date().toISOString(),
      'Metadata': JSON.stringify({
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        description
      })
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      clientSecret: session.client_secret,
      serviceRecordId: serviceRecord.id,
      amount,
      currency,
      serviceType
    });
  } catch (err) {
    console.error('Error creando sesión de pago:', err);
    return res.status(500).json({
      error: 'Error creando sesión de pago',
      message: err.message
    });
  }
}

/**
 * Procesar pago directo con token
 * POST /api/payment?action=process-payment
 */
export async function processPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { petId, serviceType, amount, currency, token, email } = req.body;

    if (!petId || !serviceType || !amount || !token) {
      return res.status(400).json({
        error: 'petId, serviceType, amount y token son requeridos'
      });
    }

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase() || 'mxn',
      payment_method: token,
      confirm: true,
      description: `${serviceType} - Servicio de Bienestar`,
      metadata: {
        petId,
        serviceType,
        platform: 'Frida5D'
      },
      receipt_email: email
    });

    if (paymentIntent.status === 'succeeded') {
      // Crear registro de servicio completado en Airtable
      const serviceRecord = await base('Servicios').create({
        'ID Mascota': [petId],
        'Tipo de Servicio': serviceType,
        'Estado del Pago': 'Completado',
        'ID Stripe': paymentIntent.id,
        'Monto': amount,
        'Moneda': currency || 'MXN',
        'Fecha': new Date().toISOString(),
        'Metadata': JSON.stringify({
          paymentIntentId: paymentIntent.id,
          status: 'succeeded'
        })
      });

      return res.status(200).json({
        success: true,
        message: 'Pago procesado exitosamente',
        paymentIntentId: paymentIntent.id,
        serviceRecordId: serviceRecord.id,
        status: 'succeeded'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'El pago requiere acción adicional',
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret
      });
    }
  } catch (err) {
    console.error('Error procesando pago:', err);
    
    // Registrar pago fallido en Airtable
    if (req.body.petId && req.body.serviceType) {
      try {
        await base('Servicios').create({
          'ID Mascota': [req.body.petId],
          'Tipo de Servicio': req.body.serviceType,
          'Estado del Pago': 'Fallido',
          'Monto': req.body.amount,
          'Moneda': req.body.currency || 'MXN',
          'Error': err.message,
          'Fecha': new Date().toISOString()
        });
      } catch (airtableErr) {
        console.error('Error registrando fallo en Airtable:', airtableErr);
      }
    }

    return res.status(400).json({
      error: 'Error procesando pago',
      message: err.message
    });
  }
}

/**
 * Verificar estado de pago
 * GET /api/payment?action=verify&sessionId=xxx
 */
export async function verifyPayment(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, paymentIntentId } = req.query;

    if (!sessionId && !paymentIntentId) {
      return res.status(400).json({
        error: 'sessionId o paymentIntentId es requerido'
      });
    }

    let paymentStatus;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentStatus = {
        status: session.payment_status,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency
      };
    } else {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentStatus = {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    }

    return res.status(200).json({
      success: true,
      ...paymentStatus
    });
  } catch (err) {
    console.error('Error verificando pago:', err);
    return res.status(500).json({
      error: 'Error verificando estado de pago'
    });
  }
}

/**
 * Reembolsar pago
 * POST /api/payment?action=refund
 */
export async function refundPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId es requerido' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer'
    });

    // Actualizar estado en Airtable
    const records = await base('Servicios').select({
      filterByFormula: `{ID Stripe} = '${paymentIntentId}'`
    }).firstPage();

    if (records.length > 0) {
      await base('Servicios').update(records[0].id, {
        'Estado del Pago': 'Reembolsado',
        'Monto Reembolsado': refund.amount / 100
      });
    }

    return res.status(200).json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    });
  } catch (err) {
    console.error('Error reembolsando pago:', err);
    return res.status(500).json({
      error: 'Error procesando reembolso'
    });
  }
}

/**
 * Obtener historial de pagos
 * GET /api/payment?action=history&petId=xxx
 */
export async function getPaymentHistory(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { petId } = req.query;

    if (!petId) {
      return res.status(400).json({ error: 'petId es requerido' });
    }

    const records = await base('Servicios').select({
      filterByFormula: `FIND('${petId}', IF({ID Mascota}, CONCATENATE({ID Mascota}),'')) > 0`,
      sort: [{ field: 'Fecha', direction: 'desc' }]
    }).firstPage();

    return res.status(200).json({
      success: true,
      history: records.map(record => ({
        id: record.id,
        petId: record.fields['ID Mascota']?.[0],
        serviceType: record.fields['Tipo de Servicio'],
        amount: record.fields['Monto'],
        currency: record.fields['Moneda'],
        status: record.fields['Estado del Pago'],
        date: record.fields['Fecha'],
        stripeId: record.fields['ID Stripe']
      }))
    });
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    return res.status(500).json({
      error: 'Error obteniendo historial de pagos'
    });
  }
}

export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'create-session':
      return createPaymentSession(req, res);
    case 'process-payment':
      return processPayment(req, res);
    case 'verify':
      return verifyPayment(req, res);
    case 'refund':
      return refundPayment(req, res);
    case 'history':
      return getPaymentHistory(req, res);
    default:
      return res.status(400).json({ error: 'Acción no válida' });
  }
}
