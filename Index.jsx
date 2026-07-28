import React from 'react';
import MicrositioCliente from './componentes/MicrositioClientejobs'; // o la ruta correcta de tu componente
import QRNFCManager from './componentes/QRNFCManager';

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">Frida 5D - ABUNDANCIA Y BIENESTAR</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="border border-purple-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Gestión de Accesos QR / NFC</h2>
          <QRNFCManager />
        </section>
        <section className="border border-purple-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Pasarela de Pagos</h2>
          <MicrositioCliente />
        </section>
      </div>
    </main>
  );
}
