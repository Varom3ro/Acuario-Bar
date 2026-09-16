import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center space-y-4 max-w-xs w-full">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#5B9BD5] flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{message}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Un momento por favor</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
