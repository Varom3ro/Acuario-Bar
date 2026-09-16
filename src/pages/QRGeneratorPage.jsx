import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer, Sparkles, QrCode } from 'lucide-react';
import { Header } from '../components/shared/Header';
import { getQrTokenMesa } from '../lib/firestoreService';

export const QRGeneratorPage = () => {
  const [cantidad, setCantidad] = useState(15);
  
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname.replace(/\/$/, '');
      return `${origin}${pathname}/#/mesa`;
    }
    return 'http://192.168.31.18:5173/#/mesa';
  };

  const baseUrl = getBaseUrl();
  const mesas = Array.from({ length: cantidad }, (_, i) => i + 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Controles web (se ocultan al imprimir) */}
      <div className="print:hidden">
        <Header
          title="Generador de QRs"
          subtitle="Acuarela Restaurant"
          rightContent={
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:text-[#5B9BD5] transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Dashboard</span>
            </Link>
          }
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <label htmlFor="cantidad" className="text-xs font-bold text-slate-700 mb-1">
                  Total de Mesas
                </label>
                <input
                  id="cantidad"
                  type="number"
                  min="1"
                  max="100"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
                  className="border border-slate-200 rounded-xl px-3 py-1.5 w-28 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#5B9BD5]"
                />
              </div>
              <div className="text-xs text-slate-400 max-w-xs">
                Se generará una tarjeta con código QR para cada mesa con validación de escaneo físico.
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Códigos QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grilla de Códigos QR para imprimir */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 print:p-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-3 print:gap-6">
          {mesas.map((numero) => {
            const token = getQrTokenMesa(numero);
            const url = `${baseUrl}/${numero}?token=${token}&scan=1`;
            return (
              <div
                key={numero}
                className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col items-center justify-between text-center space-y-3 print:shadow-none print:border-2 print:border-slate-300 print:break-inside-avoid print:p-6"
              >
                <div>
                  <div className="font-brand italic text-xl font-bold text-[#3B7BBF]">
                    Acuarela
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Escanea para ordenar
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                  <QRCodeSVG
                    value={url}
                    size={130}
                    level="H"
                    includeMargin={false}
                    className="w-full h-auto max-w-[130px]"
                  />
                </div>

                <div>
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-extrabold text-sm shadow-xs">
                    Mesa #{numero}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[140px] print:hidden">
                    Mesa #{numero}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QRGeneratorPage;
