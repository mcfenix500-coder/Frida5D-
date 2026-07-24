/**
 * Catálogo de Manos Curativas 500®
 * Sistema de precios y servicios
 */

export const SERVICES_CATALOG = {
  // Servicios Base
  'masaje-base': {
    id: 'svc-001',
    name: 'Masaje Base Manos Curativas',
    description: 'Servicio de masaje terapéutico base con productos autorizados',
    price: 1500,
    currency: 'MXN',
    duration: 60,
    category: 'base',
    required_equipment: ['camilla', 'productos_autorizados'],
    therapist_max_pay: 1000
  },
  // Memorias del Alma
  'memorias-alma': {
    id: 'svc-002',
    name: 'Memorias del Alma',
    description: 'Experiencia holística de masaje y conexión emocional',
    price: 1800,
    currency: 'MXN',
    duration: 90,
    category: 'premium',
    required_equipment: ['camilla', 'productos_premium', 'audio_binaural'],
    therapist_max_pay: 1000,
    requirements: ['certificacion_EC0046', 'curso_holistico']
  },
  // Envoltura Spa
  'envoltura-spa': {
    id: 'svc-003',
    name: 'Envoltura Spa Manos Curativas',
    description: 'Tratamiento de envoltura corporal con productos naturales premium',
    price: 2000,
    currency: 'MXN',
    duration: 120,
    category: 'premium',
    required_equipment: ['camilla_especial', 'productos_envolvimiento', 'sistema_vapor'],
    therapist_max_pay: 1000,
    requirements: ['certificacion_EC0010', 'certificacion_EC0046']
  }
};

export const COMMISSION_STRUCTURE = {
  // Comisión por transacción
  transaction_commission: {
    affiliate: 0.10,      // 10% para recomendadores/afiliados
    platform: 0.05,       // 5% para la plataforma
    therapist: 0.667,     // Hasta $1,000 máximo (variable según servicio)
    reserves: 0.183       // Reserva para operaciones
  },
  
  // Bonificación por volumen
  volume_bonus: {
    tier_1: { min_transactions: 10, bonus_percent: 0.02 },
    tier_2: { min_transactions: 25, bonus_percent: 0.05 },
    tier_3: { min_transactions: 50, bonus_percent: 0.08 }
  },
  
  // Cashback por recomendación
  referral_cashback: {
    first_purchase: 0.15,  // 15% cashback en primera compra
    recurring: 0.05,       // 5% en compras recurrentes
    expiry_days: 30        // Vigencia 30 días
  }
};

export const THERAPIST_REQUIREMENTS = {
  certifications: [
    {
      code: 'EC0010',
      name: 'Certificación Especialista en Envoltura Spa',
      issuer: 'Autoridad de Certificación Holística',
      required_for: ['envoltura-spa']
    },
    {
      code: 'EC0046',
      name: 'Certificación Terapeuta Integral Holístico',
      issuer: 'Instituto de Bienestar Integral',
      required_for: ['memorias-alma', 'envoltura-spa']
    }
  ],
  
  training: [
    {
      code: 'CURSO-HOLISTICO',
      name: 'Curso de Enfoque Holístico y Conexión Emocional',
      duration: 40,
      required_for: ['memorias-alma']
    }
  ],
  
  documentation: [
    {
      type: 'demo_video',
      description: 'Video de demostración de técnica de masaje',
      max_size_mb: 100,
      formats: ['mp4', 'mov', 'avi'],
      required_for: ['masaje-base', 'memorias-alma', 'envoltura-spa']
    },
    {
      type: 'initial_inventory',
      description: 'Comprobante de compra inicial de insumos autorizados',
      min_value_mxn: 500,
      required_for: ['masaje-base', 'memorias-alma', 'envoltura-spa']
    }
  ]
};

export const LOYALTY_PROGRAM = {
  name: 'MCFRIDA5D',
  description: 'Programa de Lealtad Manos Curativas Frida5D',
  
  tiers: {
    bronze: {
      name: 'Bronce',
      min_points: 0,
      cashback_rate: 0.02,
      benefits: ['descuento_5_porciento', 'puntos_dobles_viernes']
    },
    silver: {
      name: 'Plata',
      min_points: 5000,
      cashback_rate: 0.04,
      benefits: ['descuento_10_porciento', 'prioridad_reservas', 'regalo_cumpleaños']
    },
    gold: {
      name: 'Oro',
      min_points: 15000,
      cashback_rate: 0.06,
      benefits: ['descuento_15_porciento', 'sesion_gratis_anual', 'acceso_servicios_beta']
    },
    platinum: {
      name: 'Platino',
      min_points: 30000,
      cashback_rate: 0.08,
      benefits: ['descuento_20_porciento', 'dos_sesiones_gratis', 'consultor_personal']
    }
  },
  
  // Vigencia de puntos: 30 días
  points_expiry_days: 30,
  
  // Acumulación de puntos
  points_rules: {
    purchase: 1,           // 1 punto por cada MXN gastado
    referral: 500,         // 500 puntos por referral exitoso
    review: 50,            // 50 puntos por dejar reseña
    birthday_month: 2      // 2x puntos en mes de cumpleaños
  }
};

export function validateTherapistRequirements(therapist) {
  const validations = {
    has_certifications: [],
    has_training: [],
    has_documentation: [],
    is_ready: false
  };

  // Validar certificaciones
  THERAPIST_REQUIREMENTS.certifications.forEach(cert => {
    const hasCert = therapist.certifications?.some(c => c.code === cert.code);
    validations.has_certifications.push({
      code: cert.code,
      name: cert.name,
      verified: hasCert || false
    });
  });

  // Validar capacitaciones
  THERAPIST_REQUIREMENTS.training.forEach(train => {
    const hasTraining = therapist.trainings?.some(t => t.code === train.code);
    validations.has_training.push({
      code: train.code,
      name: train.name,
      verified: hasTraining || false
    });
  });

  // Validar documentación
  THERAPIST_REQUIREMENTS.documentation.forEach(doc => {
    const hasDoc = therapist.documents?.some(d => d.type === doc.type);
    validations.has_documentation.push({
      type: doc.type,
      description: doc.description,
      verified: hasDoc || false
    });
  });

  // Determinar si está listo
  validations.is_ready = 
    validations.has_certifications.every(c => c.verified) &&
    validations.has_training.every(t => t.verified) &&
    validations.has_documentation.every(d => d.verified);

  return validations;
}

export function calculateCommission(serviceId, amount, userType = 'affiliate') {
  const service = SERVICES_CATALOG[serviceId];
  const commission = COMMISSION_STRUCTURE.transaction_commission;
  
  if (!service) return null;

  const therapist_payment = Math.min(service.therapist_max_pay, amount * commission.therapist);
  const affiliate_commission = amount * commission.affiliate;
  const platform_cut = amount * commission.platform;
  const remaining = amount - therapist_payment - affiliate_commission - platform_cut;

  return {
    service_id: serviceId,
    service_name: service.name,
    total_amount: amount,
    therapist_payment: therapist_payment,
    affiliate_commission: affiliate_commission,
    platform_cut: platform_cut,
    breakdown: {
      therapist_percent: (therapist_payment / amount * 100).toFixed(2),
      affiliate_percent: (affiliate_commission / amount * 100).toFixed(2),
      platform_percent: (platform_cut / amount * 100).toFixed(2)
    }
  };
}

export default {
  SERVICES_CATALOG,
  COMMISSION_STRUCTURE,
  THERAPIST_REQUIREMENTS,
  LOYALTY_PROGRAM,
  validateTherapistRequirements,
  calculateCommission
};