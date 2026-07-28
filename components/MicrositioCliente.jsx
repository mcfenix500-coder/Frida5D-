import React, { useState } from 'react';

export default function MicrositioCliente() {
  const [ritualSeleccionado, setRitualSeleccionado] = useState('Inmersión 5D');
  const [mensaje, setMensaje] = useState('');

  const manejarReserva = () => {
    setMensaje(`Reserva procesada con éxito para ${ritualSeleccionado}. ¡Bienvenida a la experiencia sensorial 5D!`);
  };

  return (
    <div className="p-6 bg-black text-white">
      <h2 className="text-2xl font-bold text-purple-400 mb-4">Catálogo de Lujo - Elige tu ritual terapéutico</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => setRitualSeleccionado('Ritual Obsidiana')}
          className={`p-4 border rounded-lg cursor-pointer ${ritualSeleccionado === 'Ritual Obsidiana' ? 'border-purple-400 bg-purple-950/30' : 'border-purple-900'}`}
        >
          <h3 className="font-bold text-lg">Ritual Obsidiana</h3>
          <p className="text-gray-400 text-sm">Piedras volcánicas y toque profundo</p>
          <p className="text-purple-300 font-bold mt-2">$1,500</p>
        </div>

        <div 
          onClick={() => setRitualSeleccionado('Inmersión 5D')}
          className={`p-4 border rounded-lg cursor-pointer ${ritualSeleccionado === 'Inmersión 5D' ? 'border-purple-400 bg-purple-950/30' : 'border-purple-900'}`}
        >
          <h3 className="font-bold text-lg">Inmersión 5D</h3>
          <p className="text-gray-400 text-sm">Sonoterapia binaural + toque neuromodulado</p>
          <p className="text-purple-300 font-bold mt-2">$2,200</p>
        </div>
      </div>

      <div className="p-4 border border-purple-800 rounded-lg bg-neutral-900">
        <p className="text-sm text-gray-300 mb-2">RESERVA SELECCIONADA: <strong className="text-purple-300">{ritualSeleccionado}</strong></p>
        <button 
          onClick={manejarReserva}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
        >
          Reservar Ahora vía NFC/QR
        </button>
        {mensaje && <p className="text-green-400 text-sm mt-3">{mensaje}</p>}
      </div>
    </div>
  );
}
