import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  mesaId: null,
  mesaNumero: null,

  setMesa: (id, numero) => set({ mesaId: id, mesaNumero: numero }),

  addItem: (plato) => {
    set((state) => {
      const existing = state.items.find((item) => item.plato.id === plato.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.plato.id === plato.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { plato, cantidad: 1, notas: '' }],
      };
    });
  },

  removeItem: (platoId) => {
    set((state) => {
      const existing = state.items.find((item) => item.plato.id === platoId);
      if (existing && existing.cantidad > 1) {
        return {
          items: state.items.map((item) =>
            item.plato.id === platoId
              ? { ...item, cantidad: item.cantidad - 1 }
              : item
          ),
        };
      }
      return {
        items: state.items.filter((item) => item.plato.id !== platoId),
      };
    });
  },

  deleteItem: (platoId) => {
    set((state) => ({
      items: state.items.filter((item) => item.plato.id !== platoId),
    }));
  },

  updateItemNotas: (platoId, notas) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.plato.id === platoId ? { ...item, notas } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + item.plato.precio * item.cantidad;
    }, 0);
  },

  getCount: () => {
    return get().items.reduce((count, item) => count + item.cantidad, 0);
  },
}));
