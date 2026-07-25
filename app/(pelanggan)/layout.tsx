'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ShoppingCart, History, User, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PelangganLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [jumlahKeranjang, setJumlahKeranjang] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fungsi untuk update angka di icon keranjang
  const updateBadge = () => {
    const data = JSON.parse(localStorage.getItem('keranjang') || '[]');
    setJumlahKeranjang(data.length);
  };

  useEffect(() => {
    updateBadge();
    window.addEventListener('storage', updateBadge);
    const interval = setInterval(updateBadge, 1000); 

    // Dark Mode initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    return () => {
      window.removeEventListener('storage', updateBadge);
      clearInterval(interval);
    };
  }, [pathname]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0f172a] min-h-screen font-sans text-[#191c1d] dark:text-[#f8fafc] transition-colors duration-300">
      
      {/* --- 1. NAVBAR ATAS (Statis) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 max-w-[428px] mx-auto bg-white dark:bg-[#1e293b] border-b border-[#cfc2d4]/30 dark:border-slate-700/80 shadow-sm transition-colors duration-300">
        {pathname !== '/beranda' ? (
          <button onClick={() => window.history.back()} className="text-[#500088] dark:text-[#c084fc] p-2 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-10"></div> 
        )}

        <h1 className="text-[18px] font-black text-[#500088] dark:text-[#c084fc] tracking-tight">AlfaShop</h1>
        
        <div className="flex items-center gap-1">
          <button onClick={toggleDarkMode} className="p-2 rounded-full text-[#4c4452] dark:text-slate-300 hover:bg-[#f3f4f5] dark:hover:bg-slate-700 transition-all active:scale-95">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link href="/profil" className={`p-2 rounded-full transition-all ${pathname === '/profil' ? 'bg-[#f1dbff] dark:bg-purple-900/40 text-[#500088] dark:text-[#c084fc]' : 'text-[#4c4452] dark:text-slate-300 hover:bg-[#f3f4f5] dark:hover:bg-slate-700'}`}>
            <User size={22} />
          </Link>
        </div>
      </header>

      {/* --- 2. AREA KONTEN TENAH (Dinamis) --- */}
      {/* pt-16 agar konten tidak tertutup navbar atas, pb-24 agar tidak tertutup menu bawah */}
      <main className="pt-16 pb-24 max-w-[428px] mx-auto min-h-screen">
        {children}
      </main>

      {/* --- 3. NAVIGASI BAWAH (Animated Notch Cutout) --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[70px] max-w-[428px] mx-auto bg-white dark:bg-[#1e293b] rounded-t-[32px] border-t border-[#cfc2d4]/30 dark:border-slate-700/50 transition-colors duration-300">
        <div className="relative w-full h-full flex items-center">
          
          {/* Moving Notch (The Cutout) */}
          {(() => {
            const activeIndex = pathname === '/beranda' ? 0 : pathname === '/checkout' ? 1 : pathname.startsWith('/riwayat') ? 2 : 0;
            return (
              <div 
                className="absolute top-[-25px] w-[70px] h-[70px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-0 pointer-events-none"
                style={{ left: `calc(${(activeIndex * 33.333) + 16.666}% - 35px)` }}
              >
                {/* Bulatan Cutout (Warna Page Background untuk "menghapus" navbar) */}
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#f8f9fa] dark:bg-[#0f172a]" />
                
                {/* Lengkungan Kiri */}
                <div className="absolute top-[24px] -left-[20px] w-[21px] h-[21px] bg-white dark:bg-[#1e293b]">
                  <div className="w-full h-full bg-[#f8f9fa] dark:bg-[#0f172a] rounded-br-[20px]" />
                </div>
                
                {/* Lengkungan Kanan */}
                <div className="absolute top-[24px] -right-[20px] w-[21px] h-[21px] bg-white dark:bg-[#1e293b]">
                  <div className="w-full h-full bg-[#f8f9fa] dark:bg-[#0f172a] rounded-bl-[20px]" />
                </div>
              </div>
            );
          })()}

          {/* Tabs */}
          {[
            { path: '/beranda', icon: Home, label: 'Beranda' },
            { path: '/checkout', icon: ShoppingCart, label: 'Keranjang', badge: jumlahKeranjang },
            { path: '/riwayat', icon: History, label: 'Riwayat' }
          ].map((tab) => {
            const isActive = pathname === tab.path || (tab.path === '/riwayat' && pathname.startsWith('/riwayat'));
            const Icon = tab.icon;
            return (
              <Link key={tab.path} href={tab.path} className="flex-1 h-full flex flex-col items-center justify-center relative z-10 group">
                {/* Icon Wrapper (Moves up into the notch when active) */}
                <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative flex items-center justify-center ${isActive ? '-translate-y-[24px] text-[#500088] dark:text-[#c084fc] scale-110 drop-shadow-md' : 'translate-y-0 text-[#a094a8] dark:text-slate-500 group-hover:text-[#500088] dark:group-hover:text-[#c084fc]'}`}>
                  <Icon size={isActive ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Badge */}
                  {tab.badge ? (
                    <span className={`absolute -top-2 -right-2.5 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 ${isActive ? 'bg-[#500088] text-white border-[#f8f9fa] dark:border-[#0f172a]' : 'bg-[#b4136d] text-white border-white dark:border-[#1e293b] animate-bounce'}`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                
                {/* Label (Only visible when active, slides up) */}
                <span className={`absolute bottom-[10px] text-[11px] font-bold transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive ? 'translate-y-0 opacity-100 text-[#500088] dark:text-[#c084fc]' : 'translate-y-4 opacity-0'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}