import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, UserCheck, Loader2, Sparkles, Send } from 'lucide-react';
import { solicitarUnirseAMesa, validarPinMesa } from '../../lib/firestoreService';
import { toast } from 'sonner';

export const UnirseMesaModal = ({
  isOpen,
  onClose,
  mesaNumero,
  anfitrionNombre = 'Anfitrión',
  deviceId,
  comensalNombre = '',
  solicitudEnviada = false,
  onAutorizadoExitoso,
}) => {
  const [pin, setPin] = useState('');
  const [validandoPin, setValidandoPin] = useState(false);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [nombreInput, setNombreInput] = useState(comensalNombre || '');

  if (!isOpen) return null;

  const handleEnviarSolicitud = async () => {
    const nombreFinal = nombreInput.trim() || 'Comensal';
    setEnviandoSolicitud(true);
    try {
      await solicitarUnirseAMesa(mesaNumero, deviceId, nombreFinal);
      toast.success(`Solicitud enviada a ${anfitrionNombre}. Esperando su confirmación.`);
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud');
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const handleValidarPin = async () => {
    if (!pin || pin.length < 4) {
      toast.error('Ingresa el PIN de 4 dígitos');
      return;
    }

    setValidandoPin(true);
    try {
      const nombreFinal = nombreInput.trim() || 'Comensal';
      const esValido = await validarPinMesa(mesaNumero, deviceId, nombreFinal, pin);
      if (esValido) {
        toast.success('¡PIN correcto! Te has unido a la mesa');
        if (onAutorizadoExitoso) onAutorizadoExitoso();
        onClose();
      } else {
        toast.error('PIN incorrecto. Pregunta el PIN de 4 dígitos a tu compañero');
      }
    } catch (error) {
      console.error('Error validando PIN:', error);
      toast.error('Error al validar el PIN');
    } finally {
      setValidandoPin(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-slide-in p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3B7BBF] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B7BBF] bg-blue-50 px-2 py-0.5 rounded-md">
              Mesa #{mesaNumero} Protegida
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              Unirse a la Mesa de {anfitrionNombre}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Para agregar pedidos a la cuenta de esta mesa, necesitas autorización del anfitrión o ingresar el PIN.
            </p>
          </div>

          {/* Input de tu nombre */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Tu nombre:</label>
            <input
              type="text"
              placeholder="Ej: Ana, Pedro..."
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B9BD5] focus:bg-white"
            />
          </div>

          {/* Opción 1: Solicitar Permiso al Anfitrión */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">
              Opción A: Notificar al anfitrión
            </span>
            <p className="text-[11px] text-slate-400">
              Le saldrá una alerta a {anfitrionNombre} en su teléfono para aceptarte.
            </p>

            {solicitudEnviada ? (
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-200">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Esperando aprobación de {anfitrionNombre}...</span>
              </div>
            ) : (
              <button
                onClick={handleEnviarSolicitud}
                disabled={enviandoSolicitud}
                className="w-full py-2.5 px-3 bg-[#5B9BD5] hover:bg-[#4A89C2] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {enviandoSolicitud ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Pedir permiso a {anfitrionNombre}</span>
              </button>
            )}
          </div>

          {/* Opción 2: Ingresar PIN de 4 dígitos */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">
              Opción B: O ingresa el PIN de la mesa
            </span>
            <p className="text-[11px] text-slate-400">
              El anfitrión puede ver el PIN de 4 dígitos en la parte superior de su pantalla.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="4 dígitos"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleValidarPin()}
                className="w-28 text-center text-sm font-black tracking-widest bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:border-[#5B9BD5]"
              />
              <button
                onClick={handleValidarPin}
                disabled={validandoPin || pin.length < 4}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {validandoPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>Unirme</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnirseMesaModal;
