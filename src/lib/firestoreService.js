import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { demoCategorias } from './demoData';
import { TASA_DEFAULT } from './currency';

// Generar PIN de 4 dígitos aleatorio
const generarPinMesa = () => Math.floor(1000 + Math.random() * 9000).toString();

// Generar o recuperar token seguro de escaneo para la mesa física
export const getQrTokenMesa = (mesaNumero) => {
  const salt = 'acuarela_rest_2026_';
  let hash = 0;
  const str = salt + mesaNumero;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `aq_m${mesaNumero}_${Math.abs(hash).toString(16)}`;
};

// Asegurar que las 15 mesas existan en Firestore con sus tokens
export const asegurarMesasInicializadas = async () => {
  try {
    const mesasSnap = await getDocs(collection(db, 'mesas'));
    const existentes = new Set(mesasSnap.docs.map(d => d.data().numero));

    const batch = writeBatch(db);
    let hayNuevas = false;

    for (let i = 1; i <= 15; i++) {
      if (!existentes.has(i)) {
        hayNuevas = true;
        const mesaRef = doc(db, 'mesas', `mesa-${i}`);
        batch.set(mesaRef, {
          numero: i,
          activa: true,
          qrToken: getQrTokenMesa(i),
          sesionActivaId: `sesion_${i}_${Date.now()}`,
          anfitrionId: null,
          anfitrionNombre: null,
          pinMesa: generarPinMesa(),
          comensalesAutorizados: [],
          solicitudesPendientes: [],
          creadaEn: serverTimestamp()
        });
      }
    }

    if (hayNuevas) {
      await batch.commit();
      console.log('Mesas inicializadas en Firestore');
    }
  } catch (err) {
    console.warn('Error asegurando mesas en Firestore:', err);
  }
};

// Inicializar base de datos con menú y mesas si no existen
export const inicializarDatosSiEsNecesario = async () => {
  try {
    await asegurarMesasInicializadas();

    const catSnap = await getDocs(collection(db, 'categorias'));
    if (!catSnap.empty) {
      return; // Ya existen datos
    }

    const batch = writeBatch(db);

    // 2. Crear categorías y platos
    for (const cat of demoCategorias) {
      const catRef = doc(db, 'categorias', cat.id);
      batch.set(catRef, {
        nombre: cat.nombre,
        orden: cat.orden
      });

      for (const plato of cat.platos) {
        const platoRef = doc(db, 'platos', plato.id);
        batch.set(platoRef, {
          categoriaId: cat.id,
          nombre: plato.nombre,
          descripcion: plato.descripcion,
          precio: plato.precio,
          disponible: true,
          imagen_url: plato.imagen_url || null
        });
      }
    }

    // 3. Tasa de cambio inicial
    const configRef = doc(db, 'config', 'tasa_cambio');
    batch.set(configRef, {
      tasa: TASA_DEFAULT,
      fuente: 'BCV',
      actualizadoEn: serverTimestamp()
    });

    await batch.commit();
    console.log('Datos iniciales cargados en Firestore con éxito');
  } catch (error) {
    console.error('Error al inicializar datos en Firestore:', error);
  }
};

// Obtener el menú completo (categorías con sus platos)
export const getMenuCompleto = async () => {
  await inicializarDatosSiEsNecesario();

  const catQuery = query(collection(db, 'categorias'), orderBy('orden', 'asc'));
  const catSnap = await getDocs(catQuery);

  const platosQuery = query(collection(db, 'platos'), where('disponible', '==', true));
  const platosSnap = await getDocs(platosQuery);

  const platos = platosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const categorias = catSnap.docs.map(doc => {
    const catData = doc.data();
    return {
      id: doc.id,
      ...catData,
      platos: platos.filter(p => p.categoriaId === doc.id)
    };
  }).filter(c => c.platos.length > 0);

  return categorias;
};

// Suscribirse a la tasa BCV del día en tiempo real
export const suscribirTasaBCV = (onUpdate, onError) => {
  const configRef = doc(db, 'config', 'tasa_cambio');
  return onSnapshot(configRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate(Number(data.tasa) || TASA_DEFAULT);
    } else {
      setDoc(configRef, {
        tasa: TASA_DEFAULT,
        fuente: 'BCV',
        actualizadoEn: serverTimestamp()
      }).catch(console.warn);
      onUpdate(TASA_DEFAULT);
    }
  }, (error) => {
    console.error('Error escuchando tasa BCV:', error);
    if (onError) onError(error);
  });
};

// Guardar o actualizar la tasa BCV del día
export const guardarTasaBCV = async (nuevaTasa) => {
  const val = Number(nuevaTasa);
  if (isNaN(val) || val <= 0) throw new Error('Monto de tasa inválido');

  const configRef = doc(db, 'config', 'tasa_cambio');
  await setDoc(configRef, {
    tasa: val,
    fuente: 'BCV',
    actualizadoEn: serverTimestamp()
  }, { merge: true });
};

// Suscribirse al estado de una mesa específica
export const suscribirEstadoMesa = (numero, onUpdate, onError) => {
  const num = parseInt(numero, 10);
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  
  return onSnapshot(mesaRef, (snap) => {
    if (snap.exists()) {
      onUpdate({ id: snap.id, ...snap.data() });
    } else {
      onUpdate({
        numero: num,
        activa: true,
        qrToken: getQrTokenMesa(num),
        sesionActivaId: `sesion_${num}_inicial`,
        anfitrionId: null,
        pinMesa: '1234',
        comensalesAutorizados: [],
        solicitudesPendientes: []
      });
    }
  }, (err) => {
    console.error('Error escuchando estado de mesa:', err);
    if (onError) onError(err);
  });
};

// Suscribirse a todas las mesas (para el panel del cajero)
export const suscribirTodasLasMesas = (onUpdate, onError) => {
  const q = query(collection(db, 'mesas'), orderBy('numero', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const mesas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(mesas);
  }, (err) => {
    console.error('Error escuchando mesas:', err);
    if (onError) onError(err);
  });
};

// Verificar si una mesa existe
export const verificarMesa = async (numero) => {
  const num = parseInt(numero, 10);
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  const snap = await getDoc(mesaRef);
  if (snap.exists() && snap.data().activa) {
    return { id: snap.id, ...snap.data() };
  }
  if (num >= 1 && num <= 15) {
    return {
      numero: num,
      activa: true,
      qrToken: getQrTokenMesa(num),
      sesionActivaId: `sesion_${num}_default`,
      pinMesa: '1234'
    };
  }
  return null;
};

// Asignar primer comensal como anfitrión de la mesa
export const asegurarAnfitrionMesa = async (mesaNumero, deviceId, nombre) => {
  const num = parseInt(mesaNumero, 10);
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  const mesaSnap = await getDoc(mesaRef);

  if (mesaSnap.exists()) {
    const data = mesaSnap.data();
    if (!data.anfitrionId) {
      const pin = data.pinMesa || generarPinMesa();
      await updateDoc(mesaRef, {
        anfitrionId: deviceId,
        anfitrionNombre: nombre || 'Anfitrión',
        pinMesa: pin,
        comensalesAutorizados: [
          { id: deviceId, nombre: nombre || 'Anfitrión', rol: 'anfitrion', autorizadoEn: new Date().toISOString() }
        ]
      });
      return { rol: 'anfitrion', pin };
    }
  }
  return null;
};

// Solicitar unirse a la mesa (cuando ya hay un anfitrión)
export const solicitarUnirseAMesa = async (mesaNumero, deviceId, nombre) => {
  const num = parseInt(mesaNumero, 10);
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  const mesaSnap = await getDoc(mesaRef);

  if (mesaSnap.exists()) {
    const data = mesaSnap.data();
    const solicitudes = data.solicitudesPendientes || [];
    
    // Evitar duplicar solicitud
    if (!solicitudes.some(s => s.id === deviceId)) {
      solicitudes.push({
        id: deviceId,
        nombre: nombre || 'Comensal',
        creadaEn: new Date().toISOString()
      });
      await updateDoc(mesaRef, { solicitudesPendientes: solicitudes });
    }
  }
};

// Responder solicitud de unirse (por parte del anfitrión)
export const responderSolicitudMesa = async (mesaNumero, solDeviceId, solNombre, aceptar = true) => {
  const num = parseInt(mesaNumero, 10);
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  const mesaSnap = await getDoc(mesaRef);

  if (mesaSnap.exists()) {
    const data = mesaSnap.data();
    const solicitudes = (data.solicitudesPendientes || []).filter(s => s.id !== solDeviceId);
    const autorizados = data.comensalesAutorizados || [];

    if (aceptar && !autorizados.some(a => a.id === solDeviceId)) {
      autorizados.push({
        id: solDeviceId,
        nombre: solNombre || 'Comensal',
        rol: 'comensal',
        autorizadoEn: new Date().toISOString()
      });
    }

    await updateDoc(mesaRef, {
      solicitudesPendientes: solicitudes,
      comensalesAutorizados: autorizados
    });
  }
};

// Validar PIN de mesa para unirse instantáneamente
export const validarPinMesa = async (mesaNumero, deviceId, nombre, pinIngresado) => {
  const num = parseInt(mesaNumero, 10);
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  const mesaSnap = await getDoc(mesaRef);

  if (mesaSnap.exists()) {
    const data = mesaSnap.data();
    if (data.pinMesa && String(data.pinMesa).trim() === String(pinIngresado).trim()) {
      const autorizados = data.comensalesAutorizados || [];
      if (!autorizados.some(a => a.id === deviceId)) {
        autorizados.push({
          id: deviceId,
          nombre: nombre || 'Comensal',
          rol: 'comensal',
          autorizadoEn: new Date().toISOString()
        });
      }
      const solicitudes = (data.solicitudesPendientes || []).filter(s => s.id !== deviceId);
      await updateDoc(mesaRef, {
        comensalesAutorizados: autorizados,
        solicitudesPendientes: solicitudes
      });
      return true;
    }
  }
  return false;
};

// Crear un nuevo pedido
export const crearPedido = async ({ mesaNumero, sesionId, comensal, deviceId, notas, total, items, tasaBCV = TASA_DEFAULT }) => {
  const num = parseInt(mesaNumero, 10);

  // Asegurar anfitrión si es el primer pedido
  if (deviceId) {
    await asegurarAnfitrionMesa(num, deviceId, comensal);
  }

  const pedidosRef = collection(db, 'pedidos');
  const nuevoPedido = {
    mesa: { numero: num },
    sesionId: sesionId || `sesion_${num}_default`,
    comensal: comensal?.trim() || 'Mesa general',
    deviceId: deviceId || null,
    estado: 'pendiente', // 'pendiente' | 'en_preparacion' | 'entregado' | 'pagado'
    notas: notas || '',
    total: Number(total),
    tasaBCV: Number(tasaBCV) || TASA_DEFAULT,
    pedido_items: items.map(item => ({
      cantidad: item.cantidad,
      notas: item.notas || '',
      subtotal: item.plato.precio * item.cantidad,
      plato: {
        id: item.plato.id,
        nombre: item.plato.nombre,
        precio: item.plato.precio
      }
    })),
    created_at: new Date().toISOString(),
    creadoEnServidor: serverTimestamp()
  };

  const docRef = await addDoc(pedidosRef, nuevoPedido);
  return docRef.id;
};

// Suscribirse a pedidos en tiempo real para el Dashboard (solo pedidos activos)
export const suscribirAPedidos = (onActualizacion, onError) => {
  const q = query(collection(db, 'pedidos'), orderBy('created_at', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.estado !== 'pagado');
    onActualizacion(pedidos, snapshot.docChanges());
  }, (error) => {
    console.error('Error en suscripción de pedidos:', error);
    if (onError) onError(error);
  });
};

// Suscribirse a los pedidos activos de una mesa específica
export const suscribirAPedidosMesa = (mesaNumero, onActualizacion, onError) => {
  const num = parseInt(mesaNumero, 10);
  const q = query(
    collection(db, 'pedidos'),
    where('mesa.numero', '==', num)
  );

  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.estado !== 'pagado');

    pedidos.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    onActualizacion(pedidos);
  }, (error) => {
    console.error('Error en suscripción de pedidos por mesa:', error);
    if (onError) onError(error);
  });
};

// Cobrar y liberar una mesa (marca pedidos como pagados y resetea anfitrión/PIN)
export const cobrarYLiberarMesa = async (mesaNumero, metodoPago = 'efectivo', notasPago = '') => {
  const num = parseInt(mesaNumero, 10);
  
  const qPedidos = query(
    collection(db, 'pedidos'),
    where('mesa.numero', '==', num)
  );
  const snapPedidos = await getDocs(qPedidos);

  const batch = writeBatch(db);

  snapPedidos.docs.forEach(docSnap => {
    const data = docSnap.data();
    if (data.estado !== 'pagado') {
      batch.update(docSnap.ref, {
        estado: 'pagado',
        metodoPago: metodoPago,
        notasPago: notasPago || '',
        pagadoEn: serverTimestamp()
      });
    }
  });

  // Generar nueva sesión limpia para la mesa
  const nuevaSesionId = `sesion_${num}_${Date.now()}`;
  const nuevoPin = generarPinMesa();
  const mesaRef = doc(db, 'mesas', `mesa-${num}`);
  batch.set(mesaRef, {
    numero: num,
    activa: true,
    sesionActivaId: nuevaSesionId,
    anfitrionId: null,
    anfitrionNombre: null,
    pinMesa: nuevoPin,
    comensalesAutorizados: [],
    solicitudesPendientes: [],
    liberadaEn: serverTimestamp()
  }, { merge: true });

  await batch.commit();
  return nuevaSesionId;
};

// Actualizar el estado de un pedido individual
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  await updateDoc(pedidoRef, {
    estado: nuevoEstado,
    actualizadoEn: serverTimestamp()
  });
};
