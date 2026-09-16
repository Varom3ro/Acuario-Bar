import React from 'react';
import { UserCheck, X, Check, ShieldCheck } from 'lucide-react';
import { responderSolicitudMesa } from '../../lib/firestoreService';
import { toast } from 'sonner';

export const HostApprovalModal = ({ mesaNumero, solicitudes = [] }) => {
  if (!solicitudes || solicitudes.length === 0) return null;

  const solicitudActual = solicitudes[0];

  const handleResponder = async (aceptar) => {
    try {
      await responderSolicitudMesa(mesaNumero, solicitudActual.id, solicitudActual.nombre, aceptar);
      if (aceptar) {
        toast.success(`Has autorizado a ${solicitudActual.nombre} a pedir en tu mesa`);
      } else {
        toast.info(`Rechazaste la solicitud de ${solicitudActual.nombre}`);
      }
    } catch (error) {
      console.error('Error respondiendo solicitud:', error);
      toast.error('Error al responder solicitud');
    }
  };

  return (
    <div className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-slide-in">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#5B9BD5] p-4.5 space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B7BBF] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B7BBF] bg-blue-50 px-2 py-0.5 rounded-md">
              👑 Eres el Anfitrión de la Mesa
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm mt-1">
              ¿Autorizar a {solicitudActual.nombre}?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Desea unirse y enviar pedidos a la cuenta de tu <span className="font-bold">Mesa #{mesaNumero}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => handleResponder(false)}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Rechazar
          </button>
          <button
            onClick={() => handleResponder(true)}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Permitir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostApprovalModal;
