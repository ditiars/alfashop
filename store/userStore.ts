import { create } from 'zustand';

interface UserState {
  user: any | null;
  login: (userData: any) => void;
  logout: () => void;
  checkLogin: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null, // Default: Belum login
  
  // Fungsi saat tombol login dipencet
  login: (userData) => {
    localStorage.setItem('alfaShopUser', JSON.stringify(userData));
    set({ user: userData });
  },
  
  // Fungsi saat tombol logout dipencet
  logout: () => {
    localStorage.removeItem('alfaShopUser');
    set({ user: null });
  },
  
  // Fungsi untuk mengecek memori HP/Laptop saat web pertama kali dibuka
  checkLogin: () => {
    const stored = localStorage.getItem('alfaShopUser');
    if (stored) {
      set({ user: JSON.parse(stored) });
    }
  }
}));