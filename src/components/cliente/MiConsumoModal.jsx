import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Clock,
  ChefHat,
  CheckCircle2,
  Users,
  User,
  Divide,
  Percent,
  Sparkles,
  Plus,
  Minus,
  Coins
} from 'lucide-react';
import { formatBs, formatUSD } from '../../lib/currency';

export const MiConsumoModal = ({ isOpen, onClose, mesaNumero, pedidosMesa = [], tasa = 36.50 }) => {
  const [tabActiva, setTabActiva] = useState('total'); // 'total' | 'por_persona' | 'dividir'
  const [numPersonas, setNumPersonas] = useState(2);
  const [propinaPorcentaje, setPropinaPorcentaje] = useState(10); // 0, 10, 15, 20

  // Bloquear scroll de la página de fondo
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

  const totalAcumuladoUSD = pedidosMesa.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalItemsCount = pedidosMesa.reduce(
    (acc, p) => acc + (p.pedido_items?.reduce((iAcc, item) => iAcc + item.cantidad, 0) || 0),
    0
  );

  // Agrupar consumo por comensal
  const consumoPorComensal = pedidosMesa.reduce((acc, pedido) => {
    const nombre = pedido.comensal?.trim() || 'Mesa general';
    if (!acc[nombre]) {
      acc[nombre] = {
        nombre,
        totalUSD: 0,
        platos: [],
        pedidosCount: 0,
      };
    }
    acc[nombre].totalUSD += pedido.total || 0;
    acc[nombre].pedidosCount += 1;
    pedido.pedido_items?.forEach((item) => {
      acc[nombre].platos.push({
        nombre: item.plato?.nombre,
        cantidad: item.cantidad,
        subtotalUSD: item.subtotal,
        notas: item.notas,
      });
    });
    return acc;
  }, {});

  const listaComensales = Object.values(consumoPorComensal);

  // Cálculos de división en partes iguales
  const montoPropinaUSD = (totalAcumuladoUSD * propinaPorcentaje) / 100;
  const totalConPropinaUSD = totalAcumuladoUSD + montoPropinaUSD;
  const porPersonaSinPropinaUSD = numPersonas > 0 ? totalAcumuladoUSD / numPersonas : 0;
  const porPersonaConPropinaUSD = numPersonas > 0 ? totalConPropinaUSD / numPersonas : 0;

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#E06D48]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E06D48] animate-ping" />
            Pendiente
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <ChefHat className="w-3 h-3" />
            En Cocina
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            En Mesa
          </span>
        );
      default:
        return null;
    }
  };

  const formatearHora = (isoDate) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal / Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B7BBF] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base leading-none">
                Cuenta de la Mesa
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">Mesa #{mesaNumero}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen Total Destacado en Bs. y USD */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-xs shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Consumido ({totalItemsCount} platos)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums block leading-tight">
              {formatBs(totalAcumuladoUSD, tasa)}
            </span>
            <span className="text-xs font-bold text-[#5B9BD5] tabular-nums">
              ref. {formatUSD(totalAcumuladoUSD)} • Tasa: Bs. {tasa.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-slate-300">
              {pedidosMesa.length} comanda{pedidosMesa.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Selector de Pestañas / Modos */}
        <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex gap-1 shrink-0">
          <button
            onClick={() => setTabActiva('total')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === 'total'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Historial</span>
          </button>

          <button
            onClick={() => setTabActiva('por_persona')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === 'por_persona'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Por Persona</span>
          </button>

          <button
            onClick={() => setTabActiva('dividir')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === 'dividir'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Divide className="w-3.5 h-3.5" />
            <span>Dividir Cuenta</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
          {pedidosMesa.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
                <Receipt className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Aún no hay pedidos en esta mesa</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Cuando hagas un pedido aparecerá aquí en tiempo real.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: HISTORIAL CRONOLÓGICO */}
              {tabActiva === 'total' && (
                <div className="space-y-4 divide-y divide-slate-100">
                  {pedidosMesa.map((pedido, pIndex) => (
                    <div key={pedido.id || pIndex} className={`${pIndex > 0 ? 'pt-4' : ''} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            Comanda #{pedidosMesa.length - pIndex}
                          </span>
                          {pedido.comensal && (
                            <span className="text-[11px] font-bold text-[#3B7BBF] bg-blue-50 px-2 py-0.5 rounded-md">
                              👤 {pedido.comensal}
                            </span>
                          )}
                          {pedido.created_at && (
                            <span className="text-[11px] text-slate-400">
                              {formatearHora(pedido.created_at)}
                            </span>
                          )}
                        </div>
                        {getStatusBadge(pedido.estado)}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/80 space-y-1.5">
                        {pedido.pedido_items?.map((item, iIndex) => (
                          <div key={iIndex} className="flex justify-between items-start text-xs">
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-[#3B7BBF]">{item.cantidad}×</span>
                              <span className="text-slate-800 font-medium">{item.plato?.nombre}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-800 tabular-nums">
                                {formatBs(item.subtotal, tasa)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ({formatUSD(item.subtotal)})
                              </span>
                            </div>
                          </div>
                        ))}

                        {pedido.notas && (
                          <div className="text-[11px] text-blue-700 bg-blue-50/70 p-1.5 rounded-lg italic mt-1">
                            Nota: {pedido.notas}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs px-1">
                        <span className="text-slate-400 font-medium">Subtotal</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 tabular-nums">
                            {formatBs(pedido.total, tasa)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({formatUSD(pedido.total)})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: DESGLOSE POR COMENSAL / PERSONA */}
              {tabActiva === 'por_persona' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Aquí puedes ver lo que ordenó cada persona para saber cuánto paga cada uno por separado:
                  </p>

                  <div className="space-y-3">
                    {listaComensales.map((c, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#3B7BBF] flex items-center justify-center text-xs font-bold">
                              👤
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-sm">{c.nombre}</h3>
                              <span className="text-[10px] text-slate-400">
                                {c.platos.length} plato{c.platos.length === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Subtotal
                            </span>
                            <span className="text-base font-extrabold text-slate-900 tabular-nums block leading-tight">
                              {formatBs(c.totalUSD, tasa)}
                            </span>
                            <span className="text-[10px] font-bold text-[#5B9BD5]">
                              ref. {formatUSD(c.totalUSD)}
                            </span>
                          </div>
                        </div>

                        {/* Detalle de platos de esta persona */}
                        <div className="space-y-1.5 text-xs">
                          {c.platos.map((plato, pIdx) => (
                            <div key={pIdx} className="flex justify-between items-center text-slate-700">
                              <span className="text-slate-800">
                                <span className="font-bold text-[#5B9BD5] mr-1.5">{plato.cantidad}×</span>
                                {plato.nombre}
                              </span>
                              <div className="text-right">
                                <span className="font-semibold tabular-nums text-slate-800">
                                  {formatBs(plato.subtotalUSD, tasa)}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-1">
                                  ({formatUSD(plato.subtotalUSD)})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DIVIDIR EN PARTES IGUALES */}
              {tabActiva === 'dividir' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                    <label className="block text-xs font-bold text-slate-700">
                      ¿Entre cuántas personas dividen la cuenta?
                    </label>

                    <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
                      <button
                        onClick={() => setNumPersonas((prev) => Math.max(1, prev - 1))}
                        disabled={numPersonas <= 1}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="text-center">
                        <span className="text-2xl font-black text-slate-900 block leading-none">
                          {numPersonas}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {numPersonas === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>

                      <button
                        onClick={() => setNumPersonas((prev) => Math.min(30, prev + 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Selector de Propina */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Propina sugerida (Opcional)</span>
                      <span className="text-[#3B7BBF]">{propinaPorcentaje}%</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 10, 15, 20].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setPropinaPorcentaje(pct)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            propinaPorcentaje === pct
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pct === 0 ? 'Sin propina' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tarjeta de resultado por persona en Bs. y USD */}
                  <div className="bg-gradient-to-br from-[#5B9BD5]/15 via-blue-50 to-orange-50/40 rounded-2xl p-5 border border-[#5B9BD5]/30 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Total consumido:</span>
                      <div className="text-right">
                        <span className="font-bold tabular-nums text-slate-900 block">
                          {formatBs(totalAcumuladoUSD, tasa)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({formatUSD(totalAcumuladoUSD)})
                        </span>
                      </div>
                    </div>

                    {propinaPorcentaje > 0 && (
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Propina ({propinaPorcentaje}%):</span>
                        <div className="text-right">
                          <span className="font-bold tabular-nums text-slate-900 block">
                            {formatBs(montoPropinaUSD, tasa)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({formatUSD(montoPropinaUSD)})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B7BBF] block">
                          Cada persona paga:
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums block leading-tight">
                          {formatBs(porPersonaConPropinaUSD, tasa)}
                        </span>
                        <span className="text-xs font-extrabold text-[#5B9BD5]">
                          ref. {formatUSD(porPersonaConPropinaUSD)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total con propina:</span>
                        <span className="text-sm font-extrabold text-slate-800 tabular-nums block">
                          {formatBs(totalConPropinaUSD, tasa)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          ({formatUSD(totalConPropinaUSD)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Informativo */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[11px] text-slate-500">
            💳 Puedes pagar en Bs. o Divisas en caja. Tasa BCV: Bs. {tasa.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </>
  );
};

export default MiConsumoModal;
