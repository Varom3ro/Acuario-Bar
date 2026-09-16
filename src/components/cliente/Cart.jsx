import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, AlertCircle, ChefHat, User, Coins, Lock, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { crearPedido } from '../../lib/firestoreService';
import { formatBs, formatUSD } from '../../lib/currency';
import CartItem from './CartItem';

const Cart = ({
  onClose,
  onSuccess,
  tasa = 36.50,
  sesionId,
  deviceId,
  estaAutorizado = true,
  onRequerirAutorizacion,
}) => {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const mesaNumero = useCartStore((state) => state.mesaNumero);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notasGenerales, setNotasGenerales] = useState('');
  
  // Nombre del comensal para separar la cuenta
  const [comensalNombre, setComensalNombre] = useState(() => {
    return localStorage.getItem('acuarela_comensal_nombre') || '';
  });

  // Guardar el nombre en localStorage para futuros pedidos en esta mesa
  const handleNombreChange = (e) => {
    const val = e.target.value;
    setComensalNombre(val);
    localStorage.setItem('acuarela_comensal_nombre', val);
  };

  // Bloquear scroll de la página de fondo al abrir el carrito
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const totalUSD = getTotal();

  const handleEnviarPedido = async () => {
    if (items.length === 0) return;

    // Si la mesa ya tiene anfitrión y este comensal no está autorizado, pedir permiso o PIN
    if (!estaAutorizado) {
      if (onRequerirAutorizacion) onRequerirAutorizacion();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const pedidoId = await crearPedido({
        mesaNumero: mesaNumero || 1,
        sesionId: sesionId,
        deviceId: deviceId,
        comensal: comensalNombre.trim() || 'Mesa general',
        notas: notasGenerales,
        total: totalUSD,
        tasaBCV: tasa,
        items: items,
      });

      clearCart();
      setNotasGenerales('');
      onSuccess(pedidoId);
    } catch (err) {
      console.error('Error al enviar el pedido:', err);
      setError('Hubo un problema al enviar tu pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel con overscroll-contain */}
      <div className="fixed inset-y-0 right-0 max-w-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F4845F] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base leading-none">
                Tu Pedido
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">Mesa #{mesaNumero || 1}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100 overscroll-contain">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Tu pedido está vacío</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Selecciona los platos y bebidas que deseas ordenar en el menú.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Campo de Comensal / Identificador para cuenta separada */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <User className="w-3.5 h-3.5 text-[#5B9BD5]" />
                  <span>¿Quién hace este pedido? (Tu nombre):</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carlos, Ana, Mesa (Opcional)"
                  value={comensalNombre}
                  onChange={handleNombreChange}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B9BD5]"
                />
                <p className="text-[10px] text-slate-400">
                  💡 Sirve para saber cuánto consume cada comensal y separar la cuenta al pagar.
                </p>
              </div>

              {/* Lista de platos */}
              <div>
                {items.map((item) => (
                  <CartItem key={item.plato.id} item={item} tasa={tasa} />
                ))}
              </div>

              {/* Notas para la cocina */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ¿Alguna indicación especial para cocina? (Opcional)
                </label>
                <textarea
                  value={notasGenerales}
                  onChange={(e) => setNotasGenerales(e.target.value)}
                  placeholder="Ej: Por favor traer platos hondos extras, bebidas bien frías..."
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B9BD5] focus:bg-white resize-none transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-start gap-2 text-xs border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con Total Dual y Enviar */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-slate-100 shadow-lg space-y-3 shrink-0">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total a pagar (Bs.)
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-tight">
                  {formatBs(totalUSD, tasa)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Referencia
                </span>
                <span className="text-base font-extrabold text-[#5B9BD5] tabular-nums">
                  {formatUSD(totalUSD)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Coins className="w-3 h-3 text-amber-500" />
              <span>Tasa oficial BCV: Bs. {tasa.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
            </div>

            <button
              onClick={handleEnviarPedido}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer
                ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : !estaAutorizado
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-gradient-to-r from-[#F4845F] to-[#E06D48] hover:from-[#E06D48] hover:to-[#D15C37] active:scale-98 shadow-orange-500/20'
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando a cocina...
                </>
              ) : !estaAutorizado ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#5B9BD5]" />
                  Solicitar Autorización / Ingresar PIN
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  Confirmar y Enviar a Cocina
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export { Cart };
export default Cart;
