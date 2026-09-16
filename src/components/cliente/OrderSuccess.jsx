import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChefHat, BookOpen, Receipt, ArrowRight } from 'lucide-react';

const TIEMPO_AUTO_CIERRE = 4; // segundos

export const OrderSuccess = ({ mesaNumero, onVolverAlMenu, onVerConsumo }) => {
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_AUTO_CIERRE);

  useEffect(() => {
    if (segundosRestantes <= 0) {
      onVolverAlMenu();
      return;
    }

    const timer = setTimeout(() => {
      setSegundosRestantes((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [segundosRestantes, onVolverAlMenu]);

  // Cálculo del porcentaje para la barra de progreso
  const progresoPorcentaje = ((TIEMPO_AUTO_CIERRE - segundosRestantes) / TIEMPO_AUTO_CIERRE) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-7 sm:p-8 max-w-sm w-full text-center space-y-5 animate-slide-in relative overflow-hidden">
        {/* Barra de progreso de auto-retorno */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-[#5B9BD5] to-[#F4845F] transition-all duration-1000 ease-linear"
            style={{ width: `${progresoPorcentaje}%` }}
          />
        </div>

        {/* Ícono de éxito animado */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
            Pedido Recibido
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            ¡Enviado a cocina!
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            Tu comanda ya está en marcha para la{' '}
            <span className="font-extrabold text-slate-900">Mesa #{mesaNumero}</span>.
          </p>
        </div>

        {/* Mensaje de tiempo estimado */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-slate-700 text-xs font-semibold">
          <ChefHat className="w-4 h-4 text-[#F4845F]" />
          <span>Tiempo estimado: 15-25 min</span>
        </div>

        {/* Botones de acción inmediata */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onVolverAlMenu}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <BookOpen className="w-4 h-4" />
            <span>Volver a la Carta ({segundosRestantes}s)</span>
          </button>

          <button
            onClick={onVerConsumo}
            className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-[#3B7BBF] border border-blue-200/60 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Receipt className="w-4 h-4 text-[#5B9BD5]" />
            <span>Ver mi Cuenta y Estado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
