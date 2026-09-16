import React from 'react';
import MenuItem from './MenuItem';

const MenuCategory = ({ category, items, tasa = 36.50 }) => {
  if (!items || items.length === 0) return null;

  return (
    <section id={`categoria-${category.id}`} className="scroll-mt-32 space-y-3.5">
      {/* Título de categoría */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          {category.nombre}
        </h2>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400">
          {items.length} opciones
        </span>
      </div>

      {/* Grid de platos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {items.map((plato) => (
          <MenuItem key={plato.id} plato={plato} tasa={tasa} />
        ))}
      </div>
    </section>
  );
};

export { MenuCategory };
export default MenuCategory;
