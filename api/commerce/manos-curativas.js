const airtable = require('airtable');
const axios = require('axios');
const catalog = require('../../config/manos-curativas-catalog');

// Configurar Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

/**
 * Obtener catálogo de servicios
 * GET /api/commerce/manos-curativas?action=catalog
 */
export async function getCatalog(req, res) {
  try {
    return res.status(200).json({
      success: true,
      catalog: catalog.SERVICES_CATALOG,
      currency: 'MXN',
      brand: 'Manos Curativas 500®'
    });
  } catch (err) {
    console.error('Error obteniendo catálogo:', err);
    return res.status(500).json({ error: 'Error obteniendo catálogo' });
  }
}

/**
 * Procesar transacción con comisiones
 * POST /api/commerce/manos-curativas?action=process-transaction
 */
export async function processTransaction(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { serviceId, amount, therapistId, clientId, referrerId } = req.body;

    // Validar datos
    if (!serviceId || !amount || !therapistId || !clientId) {
      return res.status(400).json({
        error: 'serviceId, amount, therapistId y clientId son requeridos'
      });
    }

    const service = catalog.SERVICES_CATALOG[serviceId];
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Calcular comisiones
    const commission = catalog.calculateCommission(serviceId, amount);

    // Registrar transacción en Airtable
    const transaction = await base('Transacciones Manos Curativas').create({
      'Fecha': new Date().toISOString(),
      'Servicio': serviceId,
      'Cliente': [clientId],
      'Terapeuta': [therapistId],
      'Referidor': referrerId ? [referrerId] : [],
      'Monto Total': amount,
      'Pago Terapeuta': commission.therapist_payment,
      'Comisión Afiliado': commission.affiliate_commission,
      'Margen Plataforma': commission.platform_cut,
      'Estado': 'Completado',
      'Metadata': JSON.stringify({
        breakdown: commission.breakdown,
        timestamp: new Date().getTime()
      })
    });

    // Registrar cashback si hay referidor
    if (referrerId) {
      const cashbackAmount = amount * catalog.COMMISSION_STRUCTURE.referral_cashback.recurring;
      await base('Cashback MCFRIDA5D').create({
        'Usuario': [referrerId],
        'Monto': cashbackAmount,
        'Tipo': 'Comisión Referencia',
        'Vigencia': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        'Estado': 'Disponible',
        'Transacción Relacionada': [transaction.id]
      });
    }

    // Actualizar puntos de lealtad del cliente
    const pointsEarned = amount * catalog.LOYALTY_PROGRAM.points_rules.purchase;
    await base('Puntos Lealtad MCFRIDA5D').create({
      'Cliente': [clientId],
      'Puntos': pointsEarned,
      'Tipo': 'Compra Servicio',
      'Vigencia': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      'Transacción': [transaction.id]
    });

    // Trigger Zapier webhook
    try {
      await axios.post(process.env.ZAPIER_WEBHOOK_URL, {
        event: 'transaction_completed',
        transaction_id: transaction.id,
        service: service.name,
        amount,
        therapist_id: therapistId,
        client_id: clientId,
        commission_breakdown: commission.breakdown,
        timestamp: new Date().toISOString()
      });
    } catch (zapierErr) {
      console.error('Error enviando a Zapier:', zapierErr.message);
    }

    return res.status(200).json({
      success: true,
      transaction: {
        id: transaction.id,
        service: service.name,
        amount,
        commission_breakdown: commission.breakdown,
        therapist_payment: commission.therapist_payment,
        affiliate_commission: commission.affiliate_commission,
        platform_cut: commission.platform_cut,
        points_earned: pointsEarned,
        cashback_generated: referrerId ? amount * catalog.COMMISSION_STRUCTURE.referral_cashback.recurring : 0
      }
    });
  } catch (err) {
    console.error('Error procesando transacción:', err);
    return res.status(500).json({
      error: 'Error procesando transacción',
      message: err.message
    });
  }
}

/**
 * Validar requisitos del terapeuta
 * POST /api/commerce/manos-curativas?action=validate-therapist
 */
export async function validateTherapist(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { therapistId } = req.body;

    if (!therapistId) {
      return res.status(400).json({ error: 'therapistId es requerido' });
    }

    // Obtener datos del terapeuta
    const therapist = await base('Personal').find(therapistId);
    const therapistData = therapist.fields;

    // Validar requisitos
    const validation = catalog.validateTherapistRequirements({
      certifications: therapistData['Certificaciones'] || [],
      trainings: therapistData['Capacitaciones'] || [],
      documents: therapistData['Documentos'] || []
    });

    return res.status(200).json({
      success: true,
      therapist_id: therapistId,
      name: therapistData['Nombre'],
      validation,
      status: validation.is_ready ? 'APROBADO' : 'PENDIENTE',
      can_offer_services: validation.is_ready
    });
  } catch (err) {
    console.error('Error validando terapeuta:', err);
    return res.status(500).json({
      error: 'Error validando terapeuta'
    });
  }
}

/**
 * Obtener resumen de comisiones
 * GET /api/commerce/manos-curativas?action=commission-summary&userId=xxx
 */
export async function getCommissionSummary(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, period = 'month' } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    // Calcular período
    const now = new Date();
    const startDate = period === 'month' 
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1);

    // Obtener transacciones
    const records = await base('Transacciones Manos Curativas').select({
      filterByFormula: `AND({Referidor} = '${userId}', {Fecha} >= '${startDate.toISOString().split('T')[0]}')`
    }).firstPage();

    const totalCommission = records.reduce((sum, r) => sum + (r.fields['Comisión Afiliado'] || 0), 0);
    const totalTransactions = records.length;

    // Obtener cashback disponible
    const cashbackRecords = await base('Cashback MCFRIDA5D').select({
      filterByFormula: `AND({Usuario} = '${userId}', {Estado} = 'Disponible')`
    }).firstPage();

    const totalCashback = cashbackRecords.reduce((sum, r) => sum + (r.fields['Monto'] || 0), 0);

    return res.status(200).json({
      success: true,
      user_id: userId,
      period,
      summary: {
        total_transactions: totalTransactions,
        total_commission: totalCommission,
        total_cashback_available: totalCashback,
        average_transaction: totalTransactions > 0 ? totalCommission / totalTransactions : 0,
        currency: 'MXN'
      }
    });
  } catch (err) {
    console.error('Error obteniendo resumen:', err);
    return res.status(500).json({ error: 'Error obteniendo resumen de comisiones' });
  }
}

export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'catalog':
      return getCatalog(req, res);
    case 'process-transaction':
      return processTransaction(req, res);
    case 'validate-therapist':
      return validateTherapist(req, res);
    case 'commission-summary':
      return getCommissionSummary(req, res);
    default:
      return res.status(400).json({ error: 'Acción no válida' });
  }
}