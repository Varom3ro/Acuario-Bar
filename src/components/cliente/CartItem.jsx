import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { formatBs, formatUSD } from '../../lib/currency';

const CartItem = ({ item, tasa = 36.50 }) => {
  const { addItem, removeItem, deleteItem, updateItemNotas } = useCartStore();
  const { plato, cantidad, notas } = item;

  const subtotalUSD = plato.precio * cantidad;

  return (
    <div className="py-3.5 border-b border-slate-100 flex flex-col gap-2.5 last:border-b-0">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-sm leading-snug">{plato.nombre}</h4>
          <p className="text-slate-400 text-xs mt-0.5">
            {formatBs(plato.precio, tasa)} <span className="text-[10px]">({formatUSD(plato.precio)})</span>
          </p>
        </div>
        <div className="text-right">
          <div className="font-extrabold text-slate-900 text-sm tabular-nums">
            {formatBs(subtotalUSD, tasa)}
          </div>
          <div className="text-[10px] font-bold text-[#5B9BD5] tabular-nums">
            ref. {formatUSD(subtotalUSD)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Controles de cantidad */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          <button
            onClick={() => removeItem(plato.id)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 bg-white rounded-lg shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-extrabold text-slate-900 text-xs px-3 min-w-[24px] text-center tabular-nums">
            {cantidad}
          </span>
          <button
            onClick={() => addItem(plato)}
            className="w-7 h-7 flex items-center justify-center text-slate-600 bg-white rounded-lg shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => deleteItem(plato.id)}
          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          title="Eliminar plato"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Notas del plato */}
      <input
        type="text"
        placeholder="Nota para este plato (ej: sin cebolla, salsa aparte)"
        value={notas || ''}
        onChange={(e) => updateItemNotas(plato.id, e.target.value)}
        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#5B9BD5] focus:bg-white transition-all"
      />
    </div>
  );
};

export { CartItem };
export default CartItem;
