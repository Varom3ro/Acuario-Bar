import React from 'react';
import OrderCard from './OrderCard';

export const OrderList = ({
  orders = [],
  title,
  emptyMessage = 'No hay pedidos en esta sección',
  badgeColor = 'bg-slate-100 text-slate-700',
  tasa = 36.50,
  onCobrarMesa,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-50/70 rounded-3xl border border-slate-200/80 p-4">
      {/* Header de la columna */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
        <h2 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${badgeColor}`}>
          {orders.length}
        </span>
      </div>

      {/* Lista de órdenes */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {orders.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-medium text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              tasa={tasa}
              onCobrarMesa={onCobrarMesa}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;
