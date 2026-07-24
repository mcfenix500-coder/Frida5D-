const airtable = require('airtable');
const catalog = require('../../config/manos-curativas-catalog');

airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

/**
 * Módulo de Lealtad MCFRIDA5D
 */
class LoyaltyModule {
  /**
   * Añadir puntos a un cliente
   */
  async addPoints(clientId, points, reason = 'purchase') {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + catalog.LOYALTY_PROGRAM.points_expiry_days);

      const record = await base('Puntos Lealtad MCFRIDA5D').create({
        'Cliente': [clientId],
        'Puntos': points,
        'Tipo': reason,
        'Vigencia': expiryDate.toISOString(),
        'Estado': 'Activo',
        'Fecha Creación': new Date().toISOString()
      });

      return {
        success: true,
        record_id: record.id,
        points_added: points,
        expires_at: expiryDate
      };
    } catch (err) {
      console.error('Error añadiendo puntos:', err);
      throw err;
    }
  }

  /**
   * Obtener saldo de puntos del cliente
   */
  async getPointsBalance(clientId) {
    try {
      const now = new Date();
      const records = await base('Puntos Lealtad MCFRIDA5D').select({
        filterByFormula: `AND({Cliente} = '${clientId}', {Estado} = 'Activo', {Vigencia} >= '${now.toISOString().split('T')[0]}')`
      }).firstPage();

      const totalPoints = records.reduce((sum, r) => sum + (r.fields['Puntos'] || 0), 0);
      const expiredRecords = await base('Puntos Lealtad MCFRIDA5D').select({
        filterByFormula: `AND({Cliente} = '${clientId}', {Vigencia} < '${now.toISOString().split('T')[0]}')`
      }).firstPage();
      const expiredPoints = expiredRecords.reduce((sum, r) => sum + (r.fields['Puntos'] || 0), 0);

      // Determinar tier
      const tier = this.determineTier(totalPoints);

      return {
        total_active_points: totalPoints,
        expired_points: expiredPoints,
        tier: tier.name,
        tier_benefits: tier.benefits,
        cashback_rate: tier.cashback_rate,
        expires_in_days: catalog.LOYALTY_PROGRAM.points_expiry_days
      };
    } catch (err) {
      console.error('Error obteniendo balance:', err);
      throw err;
    }
  }

  /**
   * Convertir puntos a cashback
   */
  async redeemPoints(clientId, points) {
    try {
      // Validar puntos disponibles
      const balance = await this.getPointsBalance(clientId);
      if (balance.total_active_points < points) {
        throw new Error('Puntos insuficientes');
      }

      // Calcular cashback según tier
      const cashbackAmount = points * balance.cashback_rate;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 días de vigencia

      // Registrar cashback
      const cashbackRecord = await base('Cashback MCFRIDA5D').create({
        'Cliente': [clientId],
        'Monto': cashbackAmount,
        'Tipo': 'Canje de Puntos',
        'Puntos Canjeados': points,
        'Vigencia': expiryDate.toISOString(),
        'Estado': 'Disponible',
        'Fecha Creación': new Date().toISOString()
      });

      // Desactivar puntos canjeados
      const pointsRecords = await base('Puntos Lealtad MCFRIDA5D').select({
        filterByFormula: `AND({Cliente} = '${clientId}', {Estado} = 'Activo')`
      }).firstPage();

      let pointsRemaining = points;
      for (const record of pointsRecords) {
        if (pointsRemaining <= 0) break;
        const recordPoints = record.fields['Puntos'] || 0;
        const pointsToDeduct = Math.min(pointsRemaining, recordPoints);
        
        await base('Puntos Lealtad MCFRIDA5D').update(record.id, {
          'Puntos': recordPoints - pointsToDeduct,
          'Estado': (recordPoints - pointsToDeduct) === 0 ? 'Canjeado' : 'Activo'
        });
        
        pointsRemaining -= pointsToDeduct;
      }

      return {
        success: true,
        points_redeemed: points,
        cashback_generated: cashbackAmount,
        expires_at: expiryDate,
        currency: 'MXN'
      };
    } catch (err) {
      console.error('Error canjeando puntos:', err);
      throw err;
    }
  }

  /**
   * Obtener información de cashback disponible
   */
  async getCashbackBalance(clientId) {
    try {
      const now = new Date();
      const records = await base('Cashback MCFRIDA5D').select({
        filterByFormula: `AND({Cliente} = '${clientId}', {Estado} = 'Disponible', {Vigencia} >= '${now.toISOString().split('T')[0]}')`
      }).firstPage();

      const totalCashback = records.reduce((sum, r) => sum + (r.fields['Monto'] || 0), 0);
      const itemsExpiringSoon = records.filter(r => {
        const expiryDate = new Date(r.fields['Vigencia']);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7;
      });

      return {
        total_available: totalCashback,
        items_expiring_soon: itemsExpiringSoon.length,
        currency: 'MXN',
        brand: 'MCFRIDA5D'
      };
    } catch (err) {
      console.error('Error obteniendo cashback:', err);
      throw err;
    }
  }

  /**
   * Determinar tier según puntos
   */
  determineTier(points) {
    const tiers = catalog.LOYALTY_PROGRAM.tiers;
    
    if (points >= tiers.platinum.min_points) {
      return {
        name: 'PLATINO',
        benefits: tiers.platinum.benefits,
        cashback_rate: tiers.platinum.cashback_rate,
        min_points: tiers.platinum.min_points
      };
    } else if (points >= tiers.gold.min_points) {
      return {
        name: 'ORO',
        benefits: tiers.gold.benefits,
        cashback_rate: tiers.gold.cashback_rate,
        min_points: tiers.gold.min_points
      };
    } else if (points >= tiers.silver.min_points) {
      return {
        name: 'PLATA',
        benefits: tiers.silver.benefits,
        cashback_rate: tiers.silver.cashback_rate,
        min_points: tiers.silver.min_points
      };
    } else {
      return {
        name: 'BRONCE',
        benefits: tiers.bronze.benefits,
        cashback_rate: tiers.bronze.cashback_rate,
        min_points: tiers.bronze.min_points
      };
    }
  }
}

module.exports = LoyaltyModule;