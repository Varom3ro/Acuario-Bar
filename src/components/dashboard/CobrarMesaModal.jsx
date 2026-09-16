import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, CreditCard, Banknote, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { formatBs, formatUSD } from '../../lib/currency';
import { cerrarMesaYFinalizar } from '../../lib/firestoreService';

const METODOS_PAGO = [
  { id: 'pago_movil', label: 'Pago Móvil', icon: CreditCard, color: 'text-blue-500 bg-blue-50' },
  { id: 'punto_venta', label: 'Punto de Venta / Tarjeta', icon: CreditCard, color: 'text-purple-500 bg-purple-50' },
  { id: 'efectivo_bs', label: 'Efectivo Bolívares (Bs.)', icon: Banknote, color: 'text-emerald-500 bg-emerald-50' },
  { id: 'efectivo_usd', label: 'Efectivo Dólares ($)', icon: DollarSign, color: 'text-green-600 bg-green-50' },
  { id: 'zelle', label: 'Zelle / Transferencia', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50' },
  { id: 'otro', label: 'Mixto / Otro Método', icon: HelpCircle, color: 'text-slate-500 bg-slate-50' },
];

export const CobrarMesaModal = ({
  isOpen,
  onClose,
  mesaNumero,
  pedidos = [],
  tasa = 36.50,
  onSuccess,
}) => {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('pago_movil');
  const [notasPago, setNotasPago] = useState('');
  const [procesando, setProcesando] = useState(false);

  if (!isOpen) return null;

  // Calcular total acumulado de todos los pedidos de la mesa
  const totalUSD = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalBs = totalUSD * tasa;

  // Extraer todos los items de todos los pedidos para desglose
  const todosLosItems = pedidos.flatMap((p) =>
    (p.pedido_items || []).map((item) => ({
      ...item,
      comensal: p.comensal || 'Mesa general',
      pedidoId: p.id,
    }))
  );

  const handleConfirmarCobro = async () => {
    setProcesando(true);
    try {
      await cerrarMesaYFinalizar(mesaNumero, {
        metodoPago: metodoSeleccionado,
        notasPago: notasPago,
        totalUSD: totalUSD,
        tasa: tasa,
        pedidosIds: pedidos.map((p) => p.id),
      });

      if (onSuccess) {
        onSuccess(mesaNumero);
      }
      onClose();
    } catch (error) {
      console.error('Error al cerrar mesa:', error);
      alert('Error al cerrar mesa y registrar cobro. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-slide-in flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Cobrar y Liberar Mesa #{mesaNumero}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pedidos.length} comanda{pedidos.length === 1 ? '' : 's'} acumulada{pedidos.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Total Destacado */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Total a Cobrar
                </span>
                <div className="text-2xl sm:text-3xl font-black tabular-nums mt-0.5 text-emerald-400">
                  {formatBs(totalUSD, tasa)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Referencia
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-white tabular-nums mt-0.5">
                  {formatUSD(totalUSD)}
                </div>
              </div>
            </div>

            {/* Desglose rápido de items */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Resumen de Consumo ({todosLosItems.length} items)
              </h3>
              <div className="max-h-36 overflow-y-auto bg-slate-50 rounded-xl p-3 border border-slate-200/80 divide-y divide-slate-100 text-xs">
                {todosLosItems.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-slate-700">
                    <span className="truncate pr-2 font-medium">
                      <span className="font-bold text-slate-900 mr-1.5">{item.cantidad}×</span>
                      {item.plato?.nombre || 'Plato'}
                      {item.comensal && item.comensal !== 'Mesa general' && (
                        <span className="ml-1 text-[10px] text-[#5B9BD5] font-semibold">
                          ({item.comensal})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatBs(item.subtotal || 0, tasa)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Método de Pago Utilizado:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {METODOS_PAGO.map((m) => {
                  const Icon = m.icon;
                  const isSelected = metodoSeleccionado === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoSeleccionado(m.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-slate-700'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notas opcionales del pago (referencia bancaria, etc.) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Referencia bancaria / Observación (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: Ref #4920 Banesco / $50 billete"
                value={notasPago}
                onChange={(e) => setNotasPago(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B9BD5] focus:bg-white"
              />
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={procesando}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmarCobro}
              disabled={procesando}
              className="flex-1 py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {procesando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando cierre...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Cobro y Liberar Mesa #{mesaNumero}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CobrarMesaModal;
