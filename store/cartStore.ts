import { create } from 'zustand';

interface CartItem {
  id: string;
  nama_produk: string;
  harga: number;
  gambar_url: string;
  satuan: string;
  qty: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (produk: any) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  // Fungsi Tambah Barang
  addToCart: (produk) => set((state) => {
    const existing = state.cart.find(item => item.id === produk.id);
    if (existing) {
      return { cart: state.cart.map(item => item.id === produk.id ? { ...item, qty: item.qty + 1 } : item) };
    }
    return { cart: [...state.cart, { ...produk, qty: 1 }] };
  }),
  // Fungsi Hapus Barang
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
  // Fungsi Ubah Jumlah (+/-)
  updateQty: (id, qty) => set((state) => ({ cart: state.cart.map(item => item.id === id ? { ...item, qty } : item) })),
  // Fungsi Bersihkan Keranjang setelah bayar
  clearCart: () => set({ cart: [] }),
}));