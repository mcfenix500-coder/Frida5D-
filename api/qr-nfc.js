const QRCode = require('qrcode');
const airtable = require('airtable');
const crypto = require('crypto');

// Configurar Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

// Generar código único para QR/NFC
function generateUniqueCode(petId, serviceType) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${petId}-${serviceType}-${timestamp}-${random}`.toUpperCase();
}

// Generar QR Code
async function generateQRCode(data) {
  try {
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data));
    return qrDataUrl;
  } catch (err) {
    console.error('Error generando QR:', err);
    throw err;
  }
}

// Crear etiqueta de servicio con QR
export async function createServiceTag(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { petId, serviceType, description, notes } = req.body;

    if (!petId || !serviceType) {
      return res.status(400).json({ error: 'petId y serviceType son requeridos' });
    }

    // Generar código único
    const uniqueCode = generateUniqueCode(petId, serviceType);

    // Datos para el QR
    const qrData = {
      id: uniqueCode,
      petId,
      serviceType,
      createdAt: new Date().toISOString(),
      nfcTag: `NFC:${uniqueCode}`, // Identifier para etiqueta NFC
      platform: 'Frida5D'
    };

    // Generar código QR
    const qrCode = await generateQRCode(qrData);

    // Guardar en Airtable
    const record = await base('Etiquetas').create({
      'Código Único': uniqueCode,
      'ID Mascota': [petId],
      'Tipo de Servicio': serviceType,
      'Código QR': [{ url: qrCode }],
      'Etiqueta NFC': `NFC:${uniqueCode}`,
      'Descripción': description || '',
      'Notas': notes || '',
      'Estado': 'Activo',
      'Fecha Creación': new Date().toISOString(),
      'Fecha Escaneo': null
    });

    return res.status(201).json({
      success: true,
      tag: {
        id: record.id,
        uniqueCode,
        petId,
        serviceType,
        qrCode,
        nfcTag: qrData.nfcTag,
        createdAt: qrData.createdAt
      }
    });
  } catch (err) {
    console.error('Error creando etiqueta:', err);
    return res.status(500).json({ error: 'Error creando etiqueta de servicio' });
  }
}

// Leer/Escanear QR Code
export async function scanQRCode(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { qrData, location, notes } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: 'qrData es requerida' });
    }

    // Parsear datos del QR
    let decodedData;
    try {
      decodedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch {
      return res.status(400).json({ error: 'Formato de QR inválido' });
    }

    // Buscar la etiqueta en Airtable
    const records = await base('Etiquetas').select({
      filterByFormula: `{Código Único} = '${decodedData.id}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    const record = records[0];

    // Crear registro de escaneo
    const scanRecord = await base('Escaneos').create({
      'Etiqueta': [record.id],
      'Código Único': decodedData.id,
      'ID Mascota': decodedData.petId,
      'Tipo de Servicio': decodedData.serviceType,
      'Ubicación': location || 'No especificada',
      'Notas del Escaneo': notes || '',
      'Fecha Escaneo': new Date().toISOString(),
      'Tipo': 'QR'
    });

    // Actualizar última fecha de escaneo en la etiqueta
    await base('Etiquetas').update(record.id, {
      'Fecha Escaneo': new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      scan: {
        id: scanRecord.id,
        uniqueCode: decodedData.id,
        petId: decodedData.petId,
        serviceType: decodedData.serviceType,
        timestamp: new Date().toISOString(),
        location
      }
    });
  } catch (err) {
    console.error('Error escaneando QR:', err);
    return res.status(500).json({ error: 'Error procesando escaneo' });
  }
}

// Leer/Escanear NFC Tag
export async function scanNFCTag(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nfcId, location, notes } = req.body;

    if (!nfcId) {
      return res.status(400).json({ error: 'nfcId es requerida' });
    }

    // Buscar etiqueta por identificador NFC
    const records = await base('Etiquetas').select({
      filterByFormula: `{Etiqueta NFC} = '${nfcId}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(404).json({ error: 'Etiqueta NFC no encontrada' });
    }

    const record = records[0];

    // Crear registro de escaneo NFC
    const scanRecord = await base('Escaneos').create({
      'Etiqueta': [record.id],
      'Código Único': record.fields['Código Único'],
      'ID Mascota': record.fields['ID Mascota'][0],
      'Tipo de Servicio': record.fields['Tipo de Servicio'],
      'Ubicación': location || 'No especificada',
      'Notas del Escaneo': notes || '',
      'Fecha Escaneo': new Date().toISOString(),
      'Tipo': 'NFC'
    });

    // Actualizar última fecha de escaneo
    await base('Etiquetas').update(record.id, {
      'Fecha Escaneo': new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      scan: {
        id: scanRecord.id,
        nfcId,
        uniqueCode: record.fields['Código Único'],
        petId: record.fields['ID Mascota'][0],
        serviceType: record.fields['Tipo de Servicio'],
        timestamp: new Date().toISOString(),
        location,
        description: record.fields['Descripción']
      }
    });
  } catch (err) {
    console.error('Error escaneando NFC:', err);
    return res.status(500).json({ error: 'Error procesando escaneo NFC' });
  }
}

// Obtener historial de escaneos
export async function getScanHistory(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { petId, uniqueCode } = req.query;

    if (!petId && !uniqueCode) {
      return res.status(400).json({ error: 'petId o uniqueCode es requerido' });
    }

    const filterFormula = uniqueCode 
      ? `{Código Único} = '${uniqueCode}'`
      : `{ID Mascota} = '${petId}'`;

    const records = await base('Escaneos').select({
      filterByFormula,
      sort: [{ field: 'Fecha Escaneo', direction: 'desc' }]
    }).firstPage();

    return res.status(200).json({
      success: true,
      history: records.map(record => ({
        id: record.id,
        uniqueCode: record.fields['Código Único'],
        petId: record.fields['ID Mascota'],
        serviceType: record.fields['Tipo de Servicio'],
        location: record.fields['Ubicación'],
        notes: record.fields['Notas del Escaneo'],
        timestamp: record.fields['Fecha Escaneo'],
        type: record.fields['Tipo']
      }))
    });
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    return res.status(500).json({ error: 'Error obteniendo historial de escaneos' });
  }
}

// Obtener etiqueta por código único
export async function getTagByCode(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uniqueCode } = req.query;

    if (!uniqueCode) {
      return res.status(400).json({ error: 'uniqueCode es requerido' });
    }

    const records = await base('Etiquetas').select({
      filterByFormula: `{Código Único} = '${uniqueCode}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    const record = records[0];

    return res.status(200).json({
      success: true,
      tag: {
        id: record.id,
        uniqueCode: record.fields['Código Único'],
        petId: record.fields['ID Mascota']?.[0],
        serviceType: record.fields['Tipo de Servicio'],
        nfcTag: record.fields['Etiqueta NFC'],
        status: record.fields['Estado'],
        createdAt: record.fields['Fecha Creación'],
        lastScannedAt: record.fields['Fecha Escaneo'],
        description: record.fields['Descripción'],
        notes: record.fields['Notas']
      }
    });
  } catch (err) {
    console.error('Error obteniendo etiqueta:', err);
    return res.status(500).json({ error: 'Error obteniendo etiqueta' });
  }
}

export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'create-tag':
      return createServiceTag(req, res);
    case 'scan-qr':
      return scanQRCode(req, res);
    case 'scan-nfc':
      return scanNFCTag(req, res);
    case 'history':
      return getScanHistory(req, res);
    case 'get-tag':
      return getTagByCode(req, res);
    default:
      return res.status(400).json({ error: 'Acción no válida' });
  }
}
