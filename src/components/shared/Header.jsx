import React from 'react';
import { ChefHat, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ title = 'Acuarela', subtitle, rightContent, isCustomer = false }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <Link to={isCustomer ? '#' : '/dashboard'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#5B9BD5] to-[#F4845F] flex items-center justify-center shadow-xs text-white group-hover:scale-105 transition-transform duration-200">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-brand italic text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                {title}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] font-semibold text-slate-600 -mt-1 tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        </Link>

        {/* Acciones y widgets derechos */}
        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
