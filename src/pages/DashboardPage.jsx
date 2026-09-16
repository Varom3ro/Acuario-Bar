import React, { useEffect, useState, useRef } from 'react';
import {
  suscribirAPedidos,
  suscribirTasaBCV,
  guardarTasaBCV,
  suscribirTodasLasMesas
} from '../lib/firestoreService';
import { OrderList } from '../components/dashboard/OrderList';
import { CobrarMesaModal } from '../components/dashboard/CobrarMesaModal';
import { MesasGridModal } from '../components/dashboard/MesasGridModal';
import { Header } from '../components/shared/Header';
import { Toaster, toast } from 'sonner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  QrCode,
  BellRing,
  Clock,
  ChefHat,
  CheckCircle2,
  DollarSign,
  Coins,
  Check,
  Edit2,
  LayoutGrid
} from 'lucide-react';
import { formatBs, formatUSD, TASA_DEFAULT } from '../lib/currency';

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignorar si el navegador bloquea el audio
  }
};

export const DashboardPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const esPrimeraCarga = useRef(true);

  // Tasa BCV
  const [tasaBCV, setTasaBCV] = useState(TASA_DEFAULT);
  const [editandoTasa, setEditandoTasa] = useState(false);
  const [inputTasa, setInputTasa] = useState(String(TASA_DEFAULT));
  const [guardandoTasa, setGuardandoTasa] = useState(false);

  // Modales de control de mesas y cobro
  const [mesasGridOpen, setMesasGridOpen] = useState(false);
  const [cobroModalOpen, setCobroModalOpen] = useState(false);
  const [mesaCobroNumero, setMesaCobroNumero] = useState(null);
  const [pedidosMesaCobro, setPedidosMesaCobro] = useState([]);

  // Suscribirse a pedidos activos en tiempo real
  useEffect(() => {
    const unsubscribe = suscribirAPedidos(
      (nuevosPedidos, cambios) => {
        setPedidos(nuevosPedidos);
        setLoading(false);

        if (!esPrimeraCarga.current) {
          const hayNuevos = cambios.some((c) => c.type === 'added');
          if (hayNuevos) {
            playNotificationSound();
            const ultimo = nuevosPedidos[0];
            toast.success(`🔔 Nuevo pedido de Mesa #${ultimo?.mesa?.numero || '?'}`);
          }
        } else {
          esPrimeraCarga.current = false;
        }
      },
      (error) => {
        console.error('Error suscribiendo a pedidos:', error);
        toast.error('Error conectando a la base de datos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Suscribirse a todas las mesas
  useEffect(() => {
    const unsubscribeMesas = suscribirTodasLasMesas((mesasData) => {
      setMesas(mesasData);
    });
    return () => unsubscribeMesas();
  }, []);

  // Suscribirse a la tasa BCV del día
  useEffect(() => {
    const unsubscribeTasa = suscribirTasaBCV((tasa) => {
      setTasaBCV(tasa || TASA_DEFAULT);
      if (!editandoTasa) {
        setInputTasa(String(tasa || TASA_DEFAULT));
      }
    });
    return () => unsubscribeTasa();
  }, [editandoTasa]);

  const handleGuardarTasa = async () => {
    const num = parseFloat(inputTasa.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      toast.error('Por favor ingresa una tasa válida en Bs.');
      return;
    }

    setGuardandoTasa(true);
    try {
      await guardarTasaBCV(num);
      toast.success(`Tasa BCV actualizada a Bs. ${num.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`);
      setEditandoTasa(false);
    } catch (error) {
      console.error('Error guardando tasa:', error);
      toast.error('No se pudo actualizar la tasa');
    } finally {
      setGuardandoTasa(false);
    }
  };

  // Abrir modal de cobro para una mesa específica
  const handleAbrirCobroMesa = (mesaNum, pedidosDeLaMesa = null) => {
    const pedidosFiltrados =
      pedidosDeLaMesa || pedidos.filter((p) => p.mesa?.numero === parseInt(mesaNum, 10));
    setMesaCobroNumero(mesaNum);
    setPedidosMesaCobro(pedidosFiltrados);
    setMesasGridOpen(false);
    setCobroModalOpen(true);
  };

  if (loading) return <LoadingSpinner message="Conectando con la cocina en tiempo real..." />;

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente');
  const enPreparacion = pedidos.filter((p) => p.estado === 'en_preparacion');
  const entregados = pedidos.filter((p) => p.estado === 'entregado');
  const totalVentasUSD = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);

  // Calcular mesas ocupadas actualmente
  const mesasOcupadasNumeros = new Set(pedidos.map((p) => p.mesa?.numero).filter(Boolean));
  const totalMesasOcupadas = mesasOcupadasNumeros.size;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header
        title="Cocina & Caja"
        subtitle="Panel de Gestión de Pedidos"
        rightContent={
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
            {/* Botón Control de Mesas (1 al 15) */}
            <button
              onClick={() => setMesasGridOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#5B9BD5]" />
              <span>Mesas</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#F4845F] text-white text-[10px] font-black">
                {totalMesasOcupadas}
              </span>
            </button>

            {/* Widget Tasa BCV interactivo */}
            <div className="flex items-center bg-white border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 gap-2">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-slate-500 hidden sm:inline">Tasa BCV:</span>
                {editandoTasa ? (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-400">Bs.</span>
                    <input
                      type="text"
                      value={inputTasa}
                      onChange={(e) => setInputTasa(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuardarTasa()}
                      autoFocus
                      className="w-16 border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs font-black text-slate-900 focus:outline-none focus:border-[#5B9BD5]"
                    />
                    <button
                      onClick={handleGuardarTasa}
                      disabled={guardandoTasa}
                      className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                      title="Guardar tasa"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setInputTasa(String(tasaBCV));
                      setEditandoTasa(true);
                    }}
                    className="flex items-center gap-1 font-black text-slate-900 hover:text-[#3B7BBF] transition-colors cursor-pointer group"
                    title="Clic para cambiar tasa BCV"
                  >
                    <span>Bs. {tasaBCV.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                    <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-[#3B7BBF] opacity-70" />
                  </button>
                )}
              </div>
            </div>

            {/* Campana de alerta */}
            <button
              onClick={() => {
                playNotificationSound();
                toast.info('Campana de alerta probada con éxito');
              }}
              title="Probar sonido de campana"
              className="p-2 text-slate-500 hover:text-[#5B9BD5] bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <BellRing className="w-4 h-4" />
            </button>

            {/* Acceso a imprimir QRs */}
            <Link
              to="/qr"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#5B9BD5] hover:text-[#3B7BBF] transition-all shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir QRs</span>
            </Link>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Barra de métricas rápidas con Bs. y USD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F4845F] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Pendientes
              </span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {pendientes.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                En Cocina
              </span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {enPreparacion.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Entregados
              </span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {entregados.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#5B9BD5] flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Por Cobrar (Activo)
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums block leading-tight">
                {formatBs(totalVentasUSD, tasaBCV)}
              </span>
              <span className="text-[10px] font-bold text-[#5B9BD5] tabular-nums">
                ref. {formatUSD(totalVentasUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* Tablero Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Columna Pendientes */}
          <OrderList
            orders={pendientes}
            title="Nuevos / Pendientes"
            emptyMessage="No hay pedidos esperando en este momento"
            icon={Clock}
            headerBg="bg-orange-100 text-[#E06D48]"
            badgeColor="bg-orange-100 text-[#E06D48]"
            tasa={tasaBCV}
            onCobrarMesa={handleAbrirCobroMesa}
          />

          {/* Columna En Preparación */}
          <OrderList
            orders={enPreparacion}
            title="En Preparación"
            emptyMessage="No hay pedidos en preparación ahora"
            icon={ChefHat}
            headerBg="bg-amber-100 text-amber-700"
            badgeColor="bg-amber-100 text-amber-800"
            tasa={tasaBCV}
            onCobrarMesa={handleAbrirCobroMesa}
          />

          {/* Columna Entregados */}
          <OrderList
            orders={entregados}
            title="Entregados a Mesa"
            emptyMessage="No hay pedidos entregados recientemente"
            icon={CheckCircle2}
            headerBg="bg-emerald-100 text-emerald-700"
            badgeColor="bg-emerald-100 text-emerald-800"
            tasa={tasaBCV}
            onCobrarMesa={handleAbrirCobroMesa}
          />
        </div>
      </main>

      {/* Modal Cuadrícula de 15 Mesas */}
      <MesasGridModal
        isOpen={mesasGridOpen}
        onClose={() => setMesasGridOpen(false)}
        mesas={mesas}
        pedidosActivos={pedidos}
        tasa={tasaBCV}
        onSeleccionarMesaParaCobro={(num, peds) => handleAbrirCobroMesa(num, peds)}
      />

      {/* Modal de Cobro y Cierre de Mesa */}
      <CobrarMesaModal
        isOpen={cobroModalOpen}
        onClose={() => setCobroModalOpen(false)}
        mesaNumero={mesaCobroNumero}
        pedidosMesa={pedidosMesaCobro}
        tasa={tasaBCV}
      />

      <Toaster position="top-right" richColors />
    </div>
  );
};
export default DashboardPage;
