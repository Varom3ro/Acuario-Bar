import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, CheckCircle2, ChefHat, MessageSquareText, AlertCircle, CreditCard } from 'lucide-react';
import { actualizarEstadoPedido } from '../../lib/firestoreService';
import { formatBs, formatUSD } from '../../lib/currency';

const OrderCard = ({ order, tasa = 36.50, onCobrarMesa }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  // Usar la tasa guardada en el pedido o la tasa actual
  const tasaPedido = order.tasaBCV || tasa;

  // Calcular tiempo relativo
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const orderDate = new Date(order.created_at || Date.now());
      const diffMs = now - orderDate;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Ahora mismo';
      if (diffMins === 1) return 'Hace 1 min';
      if (diffMins < 60) return `Hace ${diffMins} min`;

      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs === 1) return 'Hace 1 hora';
      return `Hace ${diffHrs} horas`;
    };

    calculateTime();
    setTimeAgo(calculateTime());
    const interval = setInterval(() => setTimeAgo(calculateTime()), 20000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const updateStatus = async (newStatus, successMessage) => {
    setIsUpdating(true);
    try {
      await actualizarEstadoPedido(order.id, newStatus);
      toast.success(successMessage);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar el estado del pedido');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (order.estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-[#E06D48]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E06D48] animate-ping" />
            Pendiente
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <ChefHat className="w-3 h-3" />
            En Cocina
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Entregado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/90 flex flex-col gap-3.5 animate-slide-in">
      {/* Header: Mesa, Comensal, Tiempo y Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-sm tracking-tight shadow-xs">
            Mesa {order.mesa?.numero ?? '?'}
          </span>
          {order.comensal && order.comensal !== 'Mesa general' && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#3B7BBF] font-bold text-xs border border-blue-100">
              👤 {order.comensal}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Lista de Platos solicitados */}
      <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 divide-y divide-slate-200/60">
        {order.pedido_items?.map((item, index) => (
          <div key={index} className={`py-1.5 first:pt-0 last:pb-0 ${index > 0 ? 'mt-1' : ''}`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-[#5B9BD5]/15 text-[#3B7BBF] font-bold text-xs">
                  {item.cantidad}×
                </span>
                <span className="font-semibold text-slate-800 leading-tight">
                  {item.plato?.nombre || 'Producto'}
                </span>
              </div>
              <div className="text-right ml-2 shrink-0">
                <span className="font-bold text-slate-900 text-xs tabular-nums block">
                  {formatBs(item.subtotal, tasaPedido)}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({formatUSD(item.subtotal)})
                </span>
              </div>
            </div>

            {/* Notas del item */}
            {item.notas && (
              <div className="mt-1 ml-7 flex items-start gap-1 text-xs text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                <span className="italic">{item.notas}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notas generales del pedido de la mesa */}
      {order.notas && (
        <div className="flex items-start gap-2 bg-blue-50/80 text-blue-900 p-2.5 rounded-xl text-xs border border-blue-100/80">
          <MessageSquareText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#5B9BD5]" />
          <div>
            <span className="font-bold text-blue-950">Nota de mesa: </span>
            <span className="italic">{order.notas}</span>
          </div>
        </div>
      )}

      {/* Total Dual & Botones de Acción */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-0.5 flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
            Total
          </span>
          <span className="text-base font-extrabold text-slate-900 tabular-nums block leading-tight">
            {formatBs(order.total, tasaPedido)}
          </span>
          <span className="text-[11px] font-extrabold text-[#5B9BD5] tabular-nums">
            ref. {formatUSD(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {order.estado === 'pendiente' && (
            <button
              onClick={() => updateStatus('en_preparacion', `Mesa #${order.mesa?.numero} enviada a cocina`)}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <ChefHat className="w-3.5 h-3.5" />
              {isUpdating ? 'Actualizando...' : 'A Cocina'}
            </button>
          )}

          {order.estado === 'en_preparacion' && (
            <button
              onClick={() => updateStatus('entregado', `Mesa #${order.mesa?.numero} marcada como entregada`)}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isUpdating ? 'Actualizando...' : 'Entregado'}
            </button>
          )}

          {order.estado === 'entregado' && onCobrarMesa && (
            <button
              onClick={() => onCobrarMesa(order.mesa?.numero)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-emerald-600 active:scale-95 shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cobrar Mesa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { OrderCard };
export default OrderCard;
