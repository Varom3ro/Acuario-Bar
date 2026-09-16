import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Receipt,
  Clock,
  ChefHat,
  CheckCircle2,
  Coins,
  QrCode,
  HeartHandshake,
  Lock,
  Crown,
  KeyRound,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import {
  getMenuCompleto,
  verificarMesa,
  suscribirAPedidosMesa,
  suscribirTasaBCV,
  suscribirEstadoMesa,
  getQrTokenMesa
} from '../lib/firestoreService';
import { getOrCreateDeviceId } from '../lib/deviceId';
import { useCartStore } from '../stores/useCartStore';
import { Header } from '../components/shared/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { MenuCategory } from '../components/cliente/MenuCategory';
import { Cart } from '../components/cliente/Cart';
import { OrderSuccess } from '../components/cliente/OrderSuccess';
import { MiConsumoModal } from '../components/cliente/MiConsumoModal';
import { HostApprovalModal } from '../components/cliente/HostApprovalModal';
import { UnirseMesaModal } from '../components/cliente/UnirseMesaModal';
import { formatBs, formatUSD, TASA_DEFAULT } from '../lib/currency';

export const MesaPage = () => {
  const { mesaId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token');
  const esEscaneoFisico = searchParams.get('scan') !== null || tokenParam !== null;

  // ID único del dispositivo actual
  const deviceId = getOrCreateDeviceId();

  // Mesa previa donde estuvo el usuario en este dispositivo
  const miMesaPrevia = localStorage.getItem('acuarela_mi_mesa_actual');

  // Suscribirse reactivamente al array de items del store
  const items = useCartStore((state) => state.items);
  const setMesa = useCartStore((state) => state.setMesa);
  const clearCart = useCartStore((state) => state.clearCart);
  const mesaNumero = useCartStore((state) => state.mesaNumero);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Tasa BCV del día sincronizada en tiempo real
  const [tasaBCV, setTasaBCV] = useState(TASA_DEFAULT);

  // Información de la mesa y anfitrión
  const [mesaInfo, setMesaInfo] = useState(null);
  const [unirseModalOpen, setUnirseModalOpen] = useState(false);

  // Estados de autorización de mesa
  const [accesoAutorizado, setAccesoAutorizado] = useState(() => {
    if (esEscaneoFisico) return true;
    return false;
  });
  const [pinIngresado, setPinIngresado] = useState('');
  const [pinError, setPinError] = useState('');

  // Sesión activa y persistencia de bloqueo tras cobro
  const [sesionExpirada, setSesionExpirada] = useState(() => {
    if (esEscaneoFisico) {
      localStorage.removeItem(`acuarela_mesa_${mesaId}_bloqueada`);
      return false;
    }
    return localStorage.getItem(`acuarela_mesa_${mesaId}_bloqueada`) === 'true';
  });

  // Estado para la cuenta / consumo acumulado de la mesa
  const [pedidosMesa, setPedidosMesa] = useState([]);
  const [consumoOpen, setConsumoOpen] = useState(false);

  // Cálculos reactivos instantáneos del carrito actual
  const totalItems = items.reduce((count, item) => count + item.cantidad, 0);
  const totalMontoUSD = items.reduce((total, item) => total + (item.plato.precio * item.cantidad), 0);

  // Total acumulado histórico de la mesa
  const totalConsumoAcumuladoUSD = pedidosMesa.reduce((acc, p) => acc + (p.total || 0), 0);

  // Estados de pedidos activos
  const pedidosPendientes = pedidosMesa.filter((p) => p.estado === 'pendiente');
  const pedidosEnCocina = pedidosMesa.filter((p) => p.estado === 'en_preparacion');

  // Roles y permisos dentro de la mesa
  const esAnfitrion = mesaInfo?.anfitrionId === deviceId;
  const estaAutorizado =
    !mesaInfo?.anfitrionId ||
    esAnfitrion ||
    mesaInfo?.comensalesAutorizados?.some((c) => c.id === deviceId);
  const solicitudEnviada = mesaInfo?.solicitudesPendientes?.some((s) => s.id === deviceId);

  useEffect(() => {
    const loadMesaAndMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Verificar mesa
        const mesa = await verificarMesa(mesaId);
        if (!mesa) {
          throw new Error(`La mesa #${mesaId} no está habilitada.`);
        }

        setMesa(mesa.id || `mesa-${mesaId}`, mesa.numero || parseInt(mesaId, 10));

        // 2. Cargar menú desde Firestore
        const menuData = await getMenuCompleto();
        setCategories(menuData);
      } catch (err) {
        console.error('Error cargando menú:', err);
        setError(err.message || 'Error al conectar con el restaurante');
      } finally {
        setLoading(false);
      }
    };

    if (mesaId) {
      loadMesaAndMenu();
    }
  }, [mesaId, setMesa]);

  const sesionInicialRef = useRef(null);

  // Suscribirse al estado y sesión activa de la mesa en tiempo real
  useEffect(() => {
    if (!mesaId) return;

    const unsubscribeMesa = suscribirEstadoMesa(mesaId, (mesaData) => {
      setMesaInfo(mesaData);
      const nuevaSesion = mesaData.sesionActivaId;

      if (!nuevaSesion) return;

      // 1. DETECCIÓN EN TIEMPO REAL DE COBRO Y LIBERACIÓN DE MESA
      // Si el cliente ya estaba conectado a una sesión y el cajero libera la mesa en Firestore:
      if (sesionInicialRef.current && sesionInicialRef.current !== nuevaSesion) {
        localStorage.setItem(`acuarela_mesa_${mesaId}_bloqueada`, 'true');
        localStorage.removeItem(`acuarela_mesa_${mesaId}_autorizada`);
        setSesionExpirada(true);
        setAccesoAutorizado(false);
        clearCart();
        setPedidosMesa([]);
        return;
      }

      // Si es el primer snapshot que recibimos al cargar el componente
      if (!sesionInicialRef.current) {
        sesionInicialRef.current = nuevaSesion;
      }

      // 2. SI ES ESCANEO FÍSICO POR QR (?scan=1 o ?token=...)
      // Si el cliente escaneó el QR físico de esta mesa para iniciar una nueva orden:
      if (esEscaneoFisico) {
        localStorage.setItem(`acuarela_mesa_${mesaId}_autorizada`, nuevaSesion);
        localStorage.setItem(`acuarela_mesa_${mesaId}_sesion_activa`, nuevaSesion);
        localStorage.setItem('acuarela_mi_mesa_actual', String(mesaId));
        localStorage.removeItem(`acuarela_mesa_${mesaId}_bloqueada`);
        setAccesoAutorizado(true);
        setSesionExpirada(false);
        
        // Limpiar el search param del navegador de forma silenciosa para que no quede pegado
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          /* ignore */
        }
        return;
      }

      // 3. Si este dispositivo fue bloqueado tras un cobro previo en esta mesa
      if (localStorage.getItem(`acuarela_mesa_${mesaId}_bloqueada`) === 'true') {
        setSesionExpirada(true);
        setAccesoAutorizado(false);
        return;
      }

      // 4. Comparar con la autorización guardada en el dispositivo para esta mesa
      const sesionAutorizada = localStorage.getItem(`acuarela_mesa_${mesaId}_autorizada`);

      if (sesionAutorizada && sesionAutorizada !== nuevaSesion) {
        // La mesa fue cobrada y liberada por el cajero mientras la pestaña estuvo cerrada
        localStorage.setItem(`acuarela_mesa_${mesaId}_bloqueada`, 'true');
        setSesionExpirada(true);
        setAccesoAutorizado(false);
        clearCart();
        return;
      }

      if (sesionAutorizada === nuevaSesion) {
        setAccesoAutorizado(true);
        setSesionExpirada(false);
        return;
      }

      // 5. No tiene escaneo físico ni autorización previa para esta mesa (ej: cambió URL a mano)
      setAccesoAutorizado(false);
    });

    return () => unsubscribeMesa();
  }, [mesaId, clearCart, esEscaneoFisico]);

  // Validar PIN de mesa para acceso manual o cambio de mesa
  const handleValidarPinMesa = (e) => {
    e?.preventDefault();
    if (!mesaInfo) return;

    if (pinIngresado.trim() === String(mesaInfo.pinMesa)) {
      const sesion = mesaInfo.sesionActivaId;
      sesionInicialRef.current = sesion;
      localStorage.setItem(`acuarela_mesa_${mesaId}_autorizada`, sesion);
      localStorage.setItem(`acuarela_mesa_${mesaId}_sesion_activa`, sesion);
      localStorage.setItem('acuarela_mi_mesa_actual', String(mesaId));
      localStorage.removeItem(`acuarela_mesa_${mesaId}_bloqueada`);
      setAccesoAutorizado(true);
      setSesionExpirada(false);
      setPinError('');
    } else {
      setPinError('El PIN ingresado es incorrecto.');
    }
  };

  // Suscribirse a la tasa de cambio BCV en tiempo real
  useEffect(() => {
    const unsubscribeTasa = suscribirTasaBCV((tasa) => {
      setTasaBCV(tasa || TASA_DEFAULT);
    });
    return () => unsubscribeTasa();
  }, []);

  // Suscribirse en tiempo real a los pedidos activos de esta mesa (solo si está autorizado)
  useEffect(() => {
    if (!mesaId || !accesoAutorizado) return;

    const unsubscribe = suscribirAPedidosMesa(
      mesaId,
      (pedidos) => {
        setPedidosMesa(pedidos || []);
      },
      (err) => {
        console.warn('Error escuchando consumo de la mesa:', err);
      }
    );

    return () => unsubscribe();
  }, [mesaId, accesoAutorizado]);

  // Función para volver al inicio del menú con scroll suave
  const handleVolverAlInicio = () => {
    setOrderSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDesbloquearManualmente = () => {
    if (mesaInfo?.sesionActivaId) {
      sesionInicialRef.current = mesaInfo.sesionActivaId;
      localStorage.setItem(`acuarela_mesa_${mesaId}_autorizada`, mesaInfo.sesionActivaId);
      localStorage.setItem(`acuarela_mesa_${mesaId}_sesion_activa`, mesaInfo.sesionActivaId);
    }
    localStorage.removeItem(`acuarela_mesa_${mesaId}_bloqueada`);
    localStorage.setItem('acuarela_mi_mesa_actual', String(mesaId));
    setSesionExpirada(false);
    setAccesoAutorizado(true);
    setPedidosMesa([]);
    clearCart();
  };

  if (loading) return <LoadingSpinner message="Cargando la carta de Acuarela..." />;

  if (error)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Mesa no disponible</h2>
          <p className="text-slate-500 text-xs mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-[#5B9BD5] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#4A89C2] transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  // Pantalla de Despedida Persistente si la sesión fue cerrada y cobrada
  if (sesionExpirada) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-200 animate-scale-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Cuenta Cobrada & Cerrada
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              ¡Gracias por tu visita a Acuarela!
            </h2>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              La cuenta de la <span className="font-bold text-slate-800">Mesa #{mesaId}</span> fue
              cerrada con éxito por el cajero y la mesa quedó liberada.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 border border-slate-100 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Esta sesión previa ha finalizado.</span>
          </div>

          <button
            onClick={handleDesbloquearManualmente}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-[#5B9BD5]" />
            <span>Iniciar nuevo pedido en esta mesa</span>
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de Mesa Protegida si el usuario intentó acceder escribiendo la URL manualmente
  if (!accesoAutorizado) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-7 sm:p-8 max-w-sm w-full text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#3B7BBF] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#5B9BD5]" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Mesa #{mesaId} Protegida
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              Escanea el QR para Ordenar
            </h2>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Para ver la carta y ordenar en la <span className="font-bold text-slate-800">Mesa #{mesaId}</span>, debes estar en la mesa y escanear su código QR físico o ingresar su PIN de 4 dígitos.
            </p>
          </div>

          <form onSubmit={handleValidarPinMesa} className="space-y-3 pt-1">
            <div className="text-left">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                PIN de la Mesa #{mesaId}:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinIngresado}
                  onChange={(e) => {
                    setPinIngresado(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  placeholder="PIN de 4 dígitos"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-base font-extrabold tracking-widest text-slate-800 focus:outline-none focus:border-[#5B9BD5] focus:bg-white transition-all"
                />
              </div>
              {pinError && (
                <p className="text-red-500 text-[11px] font-bold mt-1 text-center">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pinIngresado.length < 4}
              className="w-full py-3 bg-[#5B9BD5] hover:bg-[#4A89C2] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              Desbloquear Mesa #{mesaId}
            </button>
          </form>

          {miMesaPrevia && miMesaPrevia !== String(mesaId) && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => navigate(`/mesa/${miMesaPrevia}`)}
                className="text-xs font-bold text-[#3B7BBF] hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a mi Mesa #{miMesaPrevia}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-36">
      <Header
        subtitle="Carta Digital"
        isCustomer={true}
        rightContent={
          <div className="flex items-center gap-2">
            {/* Botón Mi Consumo / Cuenta SIEMPRE VISIBLE */}
            <button
              onClick={() => setConsumoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#3B7BBF] border border-blue-200/80 rounded-xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Ver cuenta de la mesa"
            >
              <Receipt className="w-4 h-4 text-[#5B9BD5]" />
              <span className="hidden sm:inline">Cuenta:</span>
              <span className="tabular-nums">
                {formatBs(totalConsumoAcumuladoUSD, tasaBCV)}
              </span>
            </button>

            {/* Botón Carrito en Header */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Ver mi pedido"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F4845F] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Pastilla Mesa */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold shadow-xs">
              <span>Mesa</span>
              <span className="text-[#F4845F]">#{mesaId}</span>
            </div>
          </div>
        }
      />

      {/* Hero Bienvenida Mesa con Tasa BCV, Rol de Anfitrión y PIN */}
      <div className="bg-gradient-to-br from-[#5B9BD5]/10 via-[#F4845F]/10 to-transparent border-b border-slate-200/60 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3B7BBF] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#F4845F]" />
                Bienvenido a tu mesa
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/70">
                <Coins className="w-3 h-3 text-amber-500" />
                Tasa BCV: Bs. {tasaBCV.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>

              {/* Badge de Anfitrión o Comensal */}
              {esAnfitrion ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Anfitrión • PIN: {mesaInfo?.pinMesa}</span>
                </span>
              ) : !estaAutorizado ? (
                <button
                  onClick={() => setUnirseModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-800 bg-blue-100/90 hover:bg-blue-200 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-xs cursor-pointer transition-colors"
                >
                  <Lock className="w-3 h-3 text-[#5B9BD5]" />
                  <span>Unirse con PIN o Permiso</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Comensal Autorizado</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Haz tu pedido directo a cocina
            </h1>
          </div>

          {/* Tarjeta interactiva de Consumo de la Mesa */}
          <button
            onClick={() => setConsumoOpen(true)}
            className="inline-flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B9BD5] to-[#F4845F] text-white flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Consumo de la Mesa
                  </span>
                  {pedidosPendientes.length > 0 ? (
                    <span className="w-2 h-2 rounded-full bg-[#E06D48] animate-ping" />
                  ) : pedidosEnCocina.length > 0 ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  ) : null}
                </div>
                <span className="text-sm font-black text-slate-900 tabular-nums block leading-tight">
                  {formatBs(totalConsumoAcumuladoUSD, tasaBCV)}
                </span>
                <span className="text-[10px] font-bold text-[#5B9BD5]">
                  ref. {formatUSD(totalConsumoAcumuladoUSD)}
                </span>
              </div>
            </div>
            <div className="text-right pl-3 border-l border-slate-100">
              <span className="text-xs font-bold text-[#3B7BBF] group-hover:underline block">
                Ver cuenta →
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {pedidosPendientes.length > 0
                  ? '1 pedido pendiente'
                  : pedidosEnCocina.length > 0
                  ? 'Preparando en cocina'
                  : pedidosMesa.length > 0
                  ? 'Todos entregados'
                  : 'Sin pedidos aún'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Navegación Sticky de Categorías */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-2.5 overflow-x-auto no-scrollbar flex gap-2">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#categoria-${cat.id}`}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-[#5B9BD5] hover:text-white transition-all whitespace-nowrap active:scale-95 shrink-0"
            >
              {cat.nombre}
            </a>
          ))}
        </div>
      </div>

      {/* Listado de Platos por Categoría con Tasa BCV */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {categories.map((cat) => (
          <MenuCategory key={cat.id} category={cat} items={cat.platos} tasa={tasaBCV} />
        ))}
      </main>

      {/* Barra Flotante / Botón de Carrito Inferior en Bs. y USD */}
      {totalItems > 0 && !sesionExpirada && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-40 animate-slide-in">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-700 text-white rounded-2xl shadow-2xl shadow-slate-950/40 flex items-center justify-between transition-all active:scale-98 cursor-pointer border border-slate-700/80"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F4845F] flex items-center justify-center font-black text-xs text-white shadow-xs">
                {totalItems}
              </div>
              <div className="text-left">
                <span className="font-extrabold text-sm block leading-tight">Ver mi pedido</span>
                <span className="text-[11px] text-slate-400">
                  {!estaAutorizado ? 'Requiere PIN o permiso del anfitrión' : 'Toca para enviar a cocina'}
                </span>
              </div>
            </div>
            <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="font-black text-sm text-white tabular-nums leading-tight">
                {formatBs(totalMontoUSD, tasaBCV)}
              </div>
              <div className="text-[10px] font-bold text-[#5B9BD5] tabular-nums">
                ref. {formatUSD(totalMontoUSD)}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Drawer del Carrito */}
      {cartOpen && (
        <Cart
          onClose={() => setCartOpen(false)}
          tasa={tasaBCV}
          sesionId={mesaInfo?.sesionActivaId}
          deviceId={deviceId}
          estaAutorizado={estaAutorizado}
          onRequerirAutorizacion={() => {
            setCartOpen(false);
            setUnirseModalOpen(true);
          }}
          onSuccess={() => {
            setCartOpen(false);
            setOrderSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Modal de Aprobación en Vivo para el Anfitrión */}
      {esAnfitrion && (
        <HostApprovalModal
          mesaNumero={mesaId}
          solicitudes={mesaInfo?.solicitudesPendientes}
        />
      )}

      {/* Modal para Unirse con PIN o Solicitud */}
      <UnirseMesaModal
        isOpen={unirseModalOpen}
        onClose={() => setUnirseModalOpen(false)}
        mesaNumero={mesaId}
        anfitrionNombre={mesaInfo?.anfitrionNombre || 'Anfitrión'}
        deviceId={deviceId}
        solicitudEnviada={solicitudEnviada}
        onAutorizadoExitoso={() => {
          setUnirseModalOpen(false);
          setCartOpen(true);
        }}
      />

      {/* Overlay de Confirmación con auto-cierre */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50">
          <OrderSuccess
            mesaNumero={mesaNumero || mesaId}
            onVolverAlMenu={handleVolverAlInicio}
            onVerConsumo={() => {
              setOrderSuccess(false);
              setConsumoOpen(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Modal de Consumo de la Mesa */}
      <MiConsumoModal
        isOpen={consumoOpen}
        onClose={() => setConsumoOpen(false)}
        mesaNumero={mesaId}
        pedidosMesa={pedidosMesa}
        tasa={tasaBCV}
      />
    </div>
  );
};
export default MesaPage;
