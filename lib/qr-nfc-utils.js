/**
 * Utilidades para QR y NFC
 */

const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Generar identificador único para QR/NFC
 * Formato: PETID-SERVICE-TIMESTAMP-RANDOMHEX
 */
export function generateUniqueIdentifier(petId, serviceType) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${petId}-${serviceType}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generar código QR en base64
 */
export async function generateQRCodeBase64(data, options = {}) {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      ...options
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(data), defaultOptions);
    return qrCode;
  } catch (err) {
    console.error('Error generando QR:', err);
    throw err;
  }
}

/**
 * Generar etiqueta NFC
 */
export function generateNFCTag(uniqueCode) {
  return `NFC:${uniqueCode}`;
}

/**
 * Validar formato de código QR
 */
export function validateQRData(qrData) {
  try {
    const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    return (
      parsed.id &&
      parsed.petId &&
      parsed.serviceType &&
      parsed.createdAt &&
      parsed.platform === 'Frida5D'
    );
  } catch {
    return false;
  }
}

/**
 * Validar identificador único
 */
export function validateUniqueCode(code) {
  const pattern = /^.*-.*-[0-9a-z]+-[A-F0-9]+$/i;
  return pattern.test(code);
}

/**
 * Extraer información del código único
 */
export function parseUniqueCode(uniqueCode) {
  const parts = uniqueCode.split('-');
  if (parts.length < 4) return null;

  return {
    petId: parts[0],
    serviceType: parts[1],
    timestamp: parseInt(parts[2], 36),
    random: parts[3]
  };
}

/**
 * Generar reporte de escaneo
 */
export function generateScanReport(scans) {
  const report = {
    totalScans: scans.length,
    scansByType: {},
    scansByLocation: {},
    timelineData: []
  };

  scans.forEach(scan => {
    // Por tipo
    if (!report.scansByType[scan.type]) {
      report.scansByType[scan.type] = 0;
    }
    report.scansByType[scan.type]++;

    // Por ubicación
    if (!report.scansByLocation[scan.location]) {
      report.scansByLocation[scan.location] = 0;
    }
    report.scansByLocation[scan.location]++;

    // Timeline
    report.timelineData.push({
      timestamp: scan.timestamp,
      location: scan.location,
      type: scan.type
    });
  });

  report.timelineData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return report;
}

/**
 * Generar código para exportar datos
 */
export function generateExportCode(petId, format = 'json') {
  const timestamp = new Date().toISOString();
  const code = `EXPORT-${petId}-${timestamp.replace(/[^0-9]/g, '')}`;
  
  return {
    code,
    timestamp,
    format,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Validar datos de pago vs etiqueta
 */
export function validatePaymentVsTag(payment, tag) {
  return (
    payment.petId === tag.petId &&
    payment.serviceType === tag.serviceType &&
    payment.timestamp <= tag.createdAt
  );
}

/**
 * Generar certificado de servicio (para impresión)
 */
export function generateServiceCertificate(service, pet) {
  return {
    id: service.id,
    certificateNumber: `CERT-${service.id}`,
    petName: pet.name,
    petId: pet.id,
    serviceType: service.serviceType,
    date: service.date,
    amount: service.amount,
    status: service.status,
    qrCode: service.qrCode,
    issueDate: new Date().toISOString()
  };
}

/**
 * Calcular estadísticas de mascota
 */
export function calculatePetStats(services, scans, tags) {
  const completedServices = services.filter(s => s.status === 'Completado');
  const failedServices = services.filter(s => s.status === 'Fallido');
  const refundedServices = services.filter(s => s.status === 'Reembolsado');

  return {
    totalServices: services.length,
    completedServices: completedServices.length,
    failedServices: failedServices.length,
    refundedServices: refundedServices.length,
    totalSpent: completedServices.reduce((sum, s) => sum + (s.amount || 0), 0),
    totalRefunded: refundedServices.reduce((sum, s) => sum + (s.refunded || 0), 0),
    activeTags: tags.filter(t => t.status === 'Activo').length,
    usedTags: tags.filter(t => t.status === 'Usado').length,
    totalScans: scans.length,
    scansPerDay: (scans.length / 30).toFixed(2), // Promedio mensual
    lastScanned: scans.length > 0 ? scans[0].timestamp : null
  };
}

/**
 * Generar resumen para notificación
 */
export function generateNotificationSummary(event, details) {
  const summaries = {
    payment_succeeded: `Pago de $${details.amount} completado para ${details.petName}`,
    payment_failed: `Error en pago para ${details.petName}: ${details.reason}`,
    tag_created: `Nueva etiqueta creada para ${details.petName} - ${details.serviceType}`,
    tag_scanned: `${details.petName} fue registrado en ${details.location}`,
    service_completed: `Servicio ${details.serviceType} completado para ${details.petName}`,
    service_pending: `Servicio ${details.serviceType} pendiente de pago para ${details.petName}`
  };

  return summaries[event] || 'Evento registrado en Frida5D';
}

export default {
  generateUniqueIdentifier,
  generateQRCodeBase64,
  generateNFCTag,
  validateQRData,
  validateUniqueCode,
  parseUniqueCode,
  generateScanReport,
  generateExportCode,
  validatePaymentVsTag,
  generateServiceCertificate,
  calculatePetStats,
  generateNotificationSummary
};
