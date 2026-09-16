import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, CreditCard, Smartphone, DollarSign, Banknote, HelpCircle, Loader2 } from 'lucide-react';
import { formatBs, formatUSD } from '../../lib/currency';
import { cobrarYLiberarMesa } from '../../lib/firestoreService';
import { toast } from 'sonner';

const METODOS_PAGO = [
  { id: 'punto', label: 'Punto de Venta', icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'pago_movil', label: 'Pago Móvil', icon: Smartphone, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'divisas', label: 'Divisas Efectivo ($)', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'efectivo_bs', label: 'Efectivo Bs.', icon: Banknote, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'mixto', label: 'Pago Mixto', icon: HelpCircle, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

export const CobrarMesaModal = ({ isOpen, onClose, mesaNumero, pedidosMesa = [], tasa = 36.50 }) => {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('punto');
  const [notasPago, setNotasPago] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Bloquear scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalUSD = pedidosMesa.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalItemsCount = pedidosMesa.reduce(
    (acc, p) => acc + (p.pedido_items?.reduce((iAcc, item) => iAcc + item.cantidad, 0) || 0),
    0
  );

  const handleConfirmarCobro = async () => {
    setProcesando(true);
    try {
      await cobrarYLiberarMesa(mesaNumero, metodoSeleccionado, notasPago);
      toast.success(`Mesa #${mesaNumero} cobrada con éxito. Mesa liberada.`);
      onClose();
    } catch (error) {
      console.error('Error al cobrar mesa:', error);
      toast.error('Ocurrió un error al procesar el cierre de mesa');
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
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B7BBF] bg-blue-50 px-2 py-0.5 rounded-md">
                Cierre de Cuenta
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Cobrar y Liberar Mesa #{mesaNumero}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Total a cobrar */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total a Cobrar ({totalItemsCount} platos en {pedidosMesa.length} comanda{pedidosMesa.length === 1 ? '' : 's'})
              </span>
              <div className="text-3xl font-black tabular-nums text-white leading-tight">
                {formatBs(totalUSD, tasa)}
              </div>
              <div className="text-sm font-bold text-[#5B9BD5] tabular-nums">
                ref. {formatUSD(totalUSD)} • Tasa: Bs. {tasa.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Selección de Método de Pago */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Selecciona el Método de Pago:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {METODOS_PAGO.map((metodo) => {
                  const Icon = metodo.icon;
                  const isSelected = metodoSeleccionado === metodo.id;
                  return (
                    <button
                      key={metodo.id}
                      onClick={() => setMetodoSeleccionado(metodo.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs scale-98'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#5B9BD5]' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold leading-tight">{metodo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Referencia o Nota de pago */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Número de Referencia / Nota de Pago (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: Ref 084920 / Pago Móvil Banesco / $50 billete"
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
