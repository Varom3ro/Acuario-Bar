import React from 'react';
import { X, LayoutGrid, CheckCircle2, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';
import { formatBs, formatUSD } from '../../lib/currency';

export const MesasGridModal = ({
  isOpen,
  onClose,
  mesas = [],
  pedidosActivos = [],
  tasa = 36.50,
  onSeleccionarMesaParaCobro,
}) => {
  if (!isOpen) return null;

  // Agrupar pedidos activos por número de mesa
  const pedidosPorMesa = pedidosActivos.reduce((acc, p) => {
    const num = p.mesa?.numero;
    if (!num) return acc;
    if (!acc[num]) acc[num] = [];
    acc[num].push(p);
    return acc;
  }, {});

  // Asegurar 15 mesas
  const listaMesas = Array.from({ length: 15 }, (_, i) => {
    const numero = i + 1;
    const mesaDb = mesas.find((m) => m.numero === numero);
    const pedidos = pedidosPorMesa[numero] || [];
    const totalUSD = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
    const tienePendientes = pedidos.some((p) => p.estado === 'pendiente');
    const tieneCocina = pedidos.some((p) => p.estado === 'en_preparacion');
    const tieneEntregados = pedidos.some((p) => p.estado === 'entregado');

    return {
      numero,
      mesaDb,
      pedidos,
      totalUSD,
      ocupada: pedidos.length > 0,
      tienePendientes,
      tieneCocina,
      tieneEntregados,
    };
  });

  const mesasOcupadasCount = listaMesas.filter((m) => m.ocupada).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden animate-slide-in flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B7BBF] flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Control y Estado de Mesas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mesasOcupadasCount} de 15 mesas ocupadas en este momento
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

          {/* Grid de Mesas */}
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {listaMesas.map((m) => {
                return (
                  <div
                    key={m.numero}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between text-left ${
                      m.ocupada
                        ? 'bg-white border-slate-300 shadow-xs hover:border-[#5B9BD5] hover:shadow-md'
                        : 'bg-slate-50/70 border-dashed border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-slate-900 text-base">
                          Mesa #{m.numero}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            m.ocupada
                              ? m.tienePendientes
                                ? 'bg-[#F4845F] animate-ping'
                                : m.tieneCocina
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                        />
                      </div>

                      {m.ocupada ? (
                        <div className="space-y-1">
                          <div className="font-extrabold text-sm text-slate-900 tabular-nums leading-tight">
                            {formatBs(m.totalUSD, tasa)}
                          </div>
                          <div className="text-[10px] font-bold text-[#5B9BD5] tabular-nums">
                            ref. {formatUSD(m.totalUSD)}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 pt-1">
                            {m.pedidos.length} comanda{m.pedidos.length === 1 ? '' : 's'}
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 text-xs font-semibold text-slate-400">
                          Mesa Libre
                        </div>
                      )}
                    </div>

                    {m.ocupada && (
                      <button
                        onClick={() => {
                          onSeleccionarMesaParaCobro(m.numero, m.pedidos);
                        }}
                        className="mt-3 w-full py-2 px-2 rounded-xl text-[11px] font-extrabold text-white bg-slate-900 hover:bg-emerald-600 transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Cobrar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MesasGridModal;
