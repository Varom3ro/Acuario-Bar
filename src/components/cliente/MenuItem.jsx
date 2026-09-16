import React from 'react';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { formatBs, formatUSD } from '../../lib/currency';

const MenuItem = ({ plato, tasa = 36.50 }) => {
  const { items, addItem, removeItem } = useCartStore();

  // Buscar si el plato ya está en el carrito
  const cartItem = items.find((item) => item.plato.id === plato.id);
  const cantidad = cartItem ? cartItem.cantidad : 0;

  const handleAdd = () => addItem(plato);
  const handleRemove = () => removeItem(plato.id);

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-slate-100 overflow-hidden flex flex-col transition-all duration-200 group">
      {/* Imagen / Placeholder */}
      <div className="h-36 sm:h-40 bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
        {plato.imagen_url ? (
          <img
            src={plato.imagen_url}
            alt={plato.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-400">
            <UtensilsCrossed className="w-6 h-6 text-[#5B9BD5]" />
          </div>
        )}
        
        {/* Pastilla de Precio Dual (Bs. y Ref USD) */}
        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-slate-100 text-right">
          <div className="font-extrabold text-xs text-slate-900 leading-tight">
            {formatBs(plato.precio, tasa)}
          </div>
          <div className="text-[10px] font-bold text-[#5B9BD5] leading-tight">
            ref. {formatUSD(plato.precio)}
          </div>
        </div>
      </div>

      {/* Info del plato */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
            {plato.nombre}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
            {plato.descripcion}
          </p>
        </div>

        {/* Controles de cantidad */}
        <div className="pt-2 border-t border-slate-100">
          {cantidad === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full py-2.5 bg-[#5B9BD5] hover:bg-[#4A89C2] active:scale-98 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={handleRemove}
                className="w-8 h-8 flex items-center justify-center text-[#F4845F] bg-white rounded-lg shadow-xs hover:bg-orange-50 active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-slate-900 text-sm px-2 tabular-nums">
                {cantidad}
              </span>
              <button
                onClick={handleAdd}
                className="w-8 h-8 flex items-center justify-center text-[#5B9BD5] bg-white rounded-lg shadow-xs hover:bg-blue-50 active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { MenuItem };
export default MenuItem;
