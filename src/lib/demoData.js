// Datos de demostración en caso de que Supabase no esté configurado
export const demoCategorias = [
  {
    id: 'cat-1',
    nombre: 'Entradas',
    orden: 1,
    platos: [
      { id: 'p1', categoria_id: 'cat-1', nombre: 'Bruschetta Clásica', descripcion: 'Pan tostado con tomate fresco, albahaca y aceite de oliva', precio: 8.50, imagen_url: null, disponible: true },
      { id: 'p2', categoria_id: 'cat-1', nombre: 'Tequeños de Queso', descripcion: 'Crujientes palitos de masa rellenos de queso blanco', precio: 9.00, imagen_url: null, disponible: true },
      { id: 'p3', categoria_id: 'cat-1', nombre: 'Nachos Supremos', descripcion: 'Nachos con guacamole, pico de gallo, crema agria y jalapeños', precio: 11.00, imagen_url: null, disponible: true },
      { id: 'p4', categoria_id: 'cat-1', nombre: 'Empanadas Mixtas (3 uds)', descripcion: 'Selección de empanadas de carne, pollo y queso', precio: 10.50, imagen_url: null, disponible: true },
    ],
  },
  {
    id: 'cat-2',
    nombre: 'Platos Fuertes',
    orden: 2,
    platos: [
      { id: 'p5', categoria_id: 'cat-2', nombre: 'Lomo de Res a la Parrilla', descripcion: 'Lomo de res jugoso con chimichurri, papas rústicas y vegetales asados', precio: 22.00, imagen_url: null, disponible: true },
      { id: 'p6', categoria_id: 'cat-2', nombre: 'Pollo a la Parmesana', descripcion: 'Pechuga empanizada con salsa marinara y queso mozzarella gratinado', precio: 17.50, imagen_url: null, disponible: true },
      { id: 'p7', categoria_id: 'cat-2', nombre: 'Salmón Glaseado', descripcion: 'Filete de salmón con glaseado de miel y mostaza, arroz al limón', precio: 24.00, imagen_url: null, disponible: true },
      { id: 'p8', categoria_id: 'cat-2', nombre: 'Chuleta de Cerdo BBQ', descripcion: 'Chuleta de cerdo bañada en salsa BBQ casera con coleslaw', precio: 18.50, imagen_url: null, disponible: true },
    ],
  },
  {
    id: 'cat-3',
    nombre: 'Pastas',
    orden: 3,
    platos: [
      { id: 'p9', categoria_id: 'cat-3', nombre: 'Fettuccine Alfredo', descripcion: 'Pasta fettuccine en cremosa salsa alfredo con pollo', precio: 15.00, imagen_url: null, disponible: true },
      { id: 'p10', categoria_id: 'cat-3', nombre: 'Spaghetti Bolognese', descripcion: 'Spaghetti con salsa bolognesa de res cocida a fuego lento', precio: 14.00, imagen_url: null, disponible: true },
      { id: 'p11', categoria_id: 'cat-3', nombre: 'Penne al Pesto', descripcion: 'Penne con pesto de albahaca fresco, tomates cherry y parmesano', precio: 13.50, imagen_url: null, disponible: true },
    ],
  },
  {
    id: 'cat-4',
    nombre: 'Ensaladas',
    orden: 4,
    platos: [
      { id: 'p12', categoria_id: 'cat-4', nombre: 'Ensalada César', descripcion: 'Lechuga romana, crutones, parmesano y aderezo césar casero', precio: 11.00, imagen_url: null, disponible: true },
      { id: 'p13', categoria_id: 'cat-4', nombre: 'Ensalada Mediterránea', descripcion: 'Mix de lechugas, aceitunas, queso feta, pepino y vinagreta', precio: 12.50, imagen_url: null, disponible: true },
    ],
  },
  {
    id: 'cat-5',
    nombre: 'Postres',
    orden: 5,
    platos: [
      { id: 'p14', categoria_id: 'cat-5', nombre: 'Tiramisú', descripcion: 'Clásico tiramisú italiano con café y mascarpone', precio: 9.50, imagen_url: null, disponible: true },
      { id: 'p15', categoria_id: 'cat-5', nombre: 'Brownie con Helado', descripcion: 'Brownie de chocolate caliente con helado de vainilla', precio: 10.00, imagen_url: null, disponible: true },
      { id: 'p16', categoria_id: 'cat-5', nombre: 'Cheesecake de Frutos Rojos', descripcion: 'Cheesecake cremoso con coulis de frutos rojos', precio: 10.50, imagen_url: null, disponible: true },
      { id: 'p17', categoria_id: 'cat-5', nombre: 'Flan de Caramelo', descripcion: 'Flan casero con caramelo dorado', precio: 7.50, imagen_url: null, disponible: true },
    ],
  },
  {
    id: 'cat-6',
    nombre: 'Bebidas',
    orden: 6,
    platos: [
      { id: 'p18', categoria_id: 'cat-6', nombre: 'Limonada Natural', descripcion: 'Limonada fresca con hierbabuena', precio: 4.50, imagen_url: null, disponible: true },
      { id: 'p19', categoria_id: 'cat-6', nombre: 'Jugo de Naranja', descripcion: 'Jugo de naranja recién exprimido', precio: 5.00, imagen_url: null, disponible: true },
      { id: 'p20', categoria_id: 'cat-6', nombre: 'Agua Mineral', descripcion: 'Agua mineral con o sin gas', precio: 3.00, imagen_url: null, disponible: true },
      { id: 'p21', categoria_id: 'cat-6', nombre: 'Refresco', descripcion: 'Coca-Cola, Sprite o Fanta', precio: 3.50, imagen_url: null, disponible: true },
      { id: 'p22', categoria_id: 'cat-6', nombre: 'Café Americano', descripcion: 'Café recién preparado', precio: 3.50, imagen_url: null, disponible: true },
      { id: 'p23', categoria_id: 'cat-6', nombre: 'Cappuccino', descripcion: 'Espresso con leche espumada', precio: 5.00, imagen_url: null, disponible: true },
      { id: 'p24', categoria_id: 'cat-6', nombre: 'Cerveza Artesanal', descripcion: 'IPA, Lager o Stout (pregunta por disponibilidad)', precio: 7.00, imagen_url: null, disponible: true },
      { id: 'p25', categoria_id: 'cat-6', nombre: 'Copa de Vino', descripcion: 'Tinto, blanco o rosado de la casa', precio: 8.50, imagen_url: null, disponible: true },
    ],
  },
]

// Pedidos de ejemplo para el dashboard
export const demoPedidos = [
  {
    id: 'pedido-1',
    mesa: { numero: 3 },
    estado: 'pendiente',
    notas: 'Sin picante por favor',
    total: 45.50,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    pedido_items: [
      { id: 'pi1', cantidad: 2, notas: null, subtotal: 17.00, plato: { nombre: 'Bruschetta Clásica' } },
      { id: 'pi2', cantidad: 1, notas: 'Término medio', subtotal: 22.00, plato: { nombre: 'Lomo de Res a la Parrilla' } },
      { id: 'pi3', cantidad: 1, notas: null, subtotal: 4.50, plato: { nombre: 'Limonada Natural' } },
    ],
  },
  {
    id: 'pedido-2',
    mesa: { numero: 7 },
    estado: 'pendiente',
    notas: null,
    total: 37.00,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    pedido_items: [
      { id: 'pi4', cantidad: 1, notas: null, subtotal: 15.00, plato: { nombre: 'Fettuccine Alfredo' } },
      { id: 'pi5', cantidad: 1, notas: 'Sin cebolla', subtotal: 17.50, plato: { nombre: 'Pollo a la Parmesana' } },
      { id: 'pi6', cantidad: 1, notas: null, subtotal: 4.50, plato: { nombre: 'Limonada Natural' } },
    ],
  },
  {
    id: 'pedido-3',
    mesa: { numero: 1 },
    estado: 'en_preparacion',
    notas: 'Mesa con niños, cubiertos extras',
    total: 52.00,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    pedido_items: [
      { id: 'pi7', cantidad: 1, notas: null, subtotal: 11.00, plato: { nombre: 'Nachos Supremos' } },
      { id: 'pi8', cantidad: 2, notas: null, subtotal: 28.00, plato: { nombre: 'Spaghetti Bolognese' } },
      { id: 'pi9', cantidad: 1, notas: null, subtotal: 10.00, plato: { nombre: 'Brownie con Helado' } },
      { id: 'pi10', cantidad: 1, notas: null, subtotal: 3.00, plato: { nombre: 'Agua Mineral' } },
    ],
  },
  {
    id: 'pedido-4',
    mesa: { numero: 5 },
    estado: 'entregado',
    notas: null,
    total: 29.00,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    pedido_items: [
      { id: 'pi11', cantidad: 1, notas: null, subtotal: 12.50, plato: { nombre: 'Ensalada Mediterránea' } },
      { id: 'pi12', cantidad: 1, notas: null, subtotal: 9.50, plato: { nombre: 'Tiramisú' } },
      { id: 'pi13', cantidad: 1, notas: null, subtotal: 7.00, plato: { nombre: 'Cerveza Artesanal' } },
    ],
  },
]
