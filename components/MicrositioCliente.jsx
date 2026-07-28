import React, { useState } from 'react';

export default function MicrositioCliente() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment?action=create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: 'REC-001',
          serviceType: 'Bienestar en Camilla',
          amount: 1000,
          currency: 'MXN',
          email: 'cliente@ejemplo.com'
        })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error al iniciar el pago: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold text-purple-400 mb-4">Micrositio de Clientes - ABUNDANCIA Y BIENESTAR</h1>
      <p className="text-gray-300 mb-4">Selecciona tu servicio en camilla para procesar tu pago de forma segura.</p>
      <button 
        onClick={handlePayment}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Conectando con Stripe...' : 'Pagar Paquete'}
      </button>
    </div>
  );
}
