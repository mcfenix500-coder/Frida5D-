import React, { useState } from 'react';

export default function CheckoutPasarela({ itemConcepto, montoTotal, referenciaId }) {
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  const procesarPagoReal = async () => {
    setCargando(true);
    setMensajeError(null);

    try {
      const respuesta = await fetch('/api/v1/pagos/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concepto: itemConcepto,
          monto: montoTotal,
          referencia: referenciaId,
        }),
      });

      const resultado = await respuesta.json();

      if (resultado.urlPasarela) {
        window.location.href = resultado.urlPasarela;
      } else {
        throw new Error(resultado.error || 'No se pudo generar la pasarela de cobro.');
      }
    } catch (err) {
      setMensajeError(err.message);
      setCargando(false);
    }
  };

  return (
    <div style={{ background: '#050505', padding: '24px', borderRadius: '12px', border: '1px solid #d4af37', color: '#fff' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>{itemConcepto}</h4>
      <p style={{ fontSize: '1.4rem', color: '#d4af37', fontWeight: 'bold' }}>${montoTotal} MXN</p>
      {mensajeError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem' }}>{mensajeError}</p>}
      <button
        onClick={procesarPagoReal}
        disabled={cargando}
        style={{
          backgroundColor: '#d4af37',
          color: '#000',
          border: 'none',
          padding: '14px 20px',
          fontWeight: 'bold',
          borderRadius: '6px',
          cursor: cargando ? 'not-allowed' : 'pointer',
          width: '100%',
          marginTop: '12px'
        }}
      >
        {cargando ? 'Conectando con pasarela...' : 'Ejecutar Cobro'}
      </button>
    </div>
  );
}
