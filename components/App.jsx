import React, { useState } from 'react';
import MicrositioCliente from './componentes/MicrositioCliente';
import QRNFCManager from './componentes/QRNFCManager';

export default function AppRouter() {
  const [vistaActual, setVistaActual] = useState('cliente');

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="flex justify-around p-4 border-b border-purple-900 bg-neutral-900">
        <button onClick={() => setVistaActual('cliente')} className={vistaActual === 'cliente' ? 'text-purple-400 font-bold' : 'text-gray-400'}>Cliente</button>
        <button onClick={() => setVistaActual('terapeuta')} className={vistaActual === 'terapeuta' ? 'text-purple-400 font-bold' : 'text-gray-400'}>Terapeuta</button>
        <button onClick={() => setVistaActual('afiliado')} className={vistaActual === 'afiliado' ? 'text-purple-400 font-bold' : 'text-gray-400'}>Negocio Afiliado</button>
        <button onClick={() => setVistaActual('telemetria')} className={vistaActual === 'telemetria' ? 'text-purple-400 font-bold' : 'text-gray-400'}>Mi Telemetría</button>
      </nav>

      <main className="p-6">
        {vistaActual === 'cliente' && <MicrositioCliente />}
        {vistaActual === 'terapeuta' && <div className="p-4 text-purple-300 font-semibold">Vista exclusiva de Terapeutas - Servicios en camilla</div>}
        {vistaActual === 'afiliado' && <div className="p-4 text-purple-300 font-semibold">Vista de Negocios Afiliados y control de Cashback</div>}
        {vistaActual === 'telemetria' && <div className="p-4"><QRNFCManager /></div>}
      </main>
    </div>
  );
}
