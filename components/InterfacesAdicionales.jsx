/* FRIDA 5D - VISTAS NUEVAS PARA COPIAR Y PEGAR */

export function InterfazTerapeuta() {
  return (
    <div className="p-6 bg-[#0A0612] text-[#F9F8FC] min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-[#D1C4E9] mb-4">Panel de Terapeuta & Afiliado</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1A102F] p-4 rounded-xl border border-[#4A3B5D]">
          <h2 className="text-lg font-semibold text-purple-300">Próxima Sesión</h2>
          <p className="text-sm text-gray-300 mt-2">Ritual Obsidiana - 75 min (Camilla)</p>
          <p className="text-xs text-purple-400 mt-1">Estado: Confirmado</p>
        </div>
        <div className="bg-[#1A102F] p-4 rounded-xl border border-[#4A3B5D]">
          <h2 className="text-lg font-semibold text-purple-300">Comisiones (40%)</h2>
          <p className="text-2xl font-bold text-green-400 mt-2">$3,520 MXN</p>
        </div>
      </div>
    </div>
  );
}

export function InterfazAdminCashback() {
  return (
    <div className="p-6 bg-[#0A0612] text-[#F9F8FC] min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-[#D1C4E9] mb-4">Panel Administrador - Fondo & Cashback</h1>
      <div className="bg-[#1A102F] p-4 rounded-xl border border-[#4A3B5D]">
        <h2 className="text-lg font-semibold text-purple-300">Inversión Capitalista Estratégica</h2>
        <p className="text-sm text-gray-300 mt-2">Capital Registrado: $25,000</p>
        <p className="text-sm text-green-400 mt-1">Cashback Acumulado (5% por TX): Operando</p>
      </div>
    </div>
  );
}
