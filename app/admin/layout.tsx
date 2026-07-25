'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotifAdmin from '@/components/NotifAdmin'; // 🔥 Import komponen NotifAdmin

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState({ name: 'Admin', role: 'admin' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🔥 State untuk buka/tutup menu di HP

  // Tutup sidebar otomatis kalau pindah halaman (khusus di HP)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    
    if (user.role !== 'admin') {
      alert('Akses ditolak! Anda bukan admin.');
      router.push('/beranda');
      return;
    }

    setAdminUser(user);
    
    const handleStorageChange = () => {
      const updatedUserStr = localStorage.getItem('user');
      if (updatedUserStr) {
        const updatedUser = JSON.parse(updatedUserStr);
        if (updatedUser.role === 'admin') {
          setAdminUser(updatedUser);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    router.push('/login'); 
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      
      <div className="bg-admin-background text-admin-on-background font-body-md antialiased flex min-h-screen relative overflow-hidden">
            {/* 🔥 Overlay gelap untuk HP (muncul saat menu dibuka) */}
        {isMobileMenuOpen && pathname !== '/admin/mobile-produk' && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Navigation Drawer (Sidebar) */}
        {/* 🔥 Ditambahkan efek transisi slide untuk HP */}
        {pathname !== '/admin/mobile-produk' && (
          <aside className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col py-6 bg-admin-surface-container-lowest h-screen w-72 border-r border-admin-outline-variant/30 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            {/* Profile Section */}
            <div className="px-6 mb-10 flex items-center justify-between gap-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-admin-primary/20 p-0.5 overflow-hidden flex items-center justify-center bg-admin-surface text-admin-primary">
                  <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
                </div>
                <div>
                  <h2 className="font-label-md text-admin-primary line-clamp-1">{adminUser.name}</h2>
                  <p className="text-[12px] font-medium text-admin-on-surface-variant uppercase tracking-wider">{adminUser.role === 'admin' ? 'Administrator' : adminUser.role}</p>
                </div>
              </div>
              {/* Tombol tutup menu (hanya di HP) */}
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-admin-on-surface-variant hover:text-admin-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto pb-6">
              <Link href="/admin" className={`${pathname === '/admin' ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname === '/admin' ? 'icon-fill' : ''}`}>dashboard</span>
                Dashboard
              </Link>
              <Link href="/admin/produk" className={`${pathname.includes('/admin/produk') && pathname !== '/admin/mobile-produk' ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/produk') && pathname !== '/admin/mobile-produk' ? 'icon-fill' : ''}`}>inventory_2</span>
                Products
              </Link>
              <Link href="/admin/bundling" className={`${pathname.includes('/admin/bundling') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/bundling') ? 'icon-fill' : ''}`}>card_giftcard</span>
                Bundling Paket
              </Link>
              <Link href="/admin/pesanan" className={`${pathname.includes('/admin/pesanan') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/pesanan') ? 'icon-fill' : ''}`}>shopping_cart</span>
                Orders
              </Link>
              <Link href="/admin/kasir" className={`${pathname.includes('/admin/kasir') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/kasir') ? 'icon-fill' : ''}`}>point_of_sale</span>
                POS
              </Link>
              <Link href="/admin/laporan" className={`${pathname.includes('/admin/laporan') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/laporan') ? 'icon-fill' : ''}`}>monitoring</span>
                Reports
              </Link>
              <div className="my-2 border-t border-admin-outline-variant/30 mx-2"></div>
              <Link href="/admin/pelanggan" className={`${pathname.includes('/admin/pelanggan') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/pelanggan') ? 'icon-fill' : ''}`}>group</span>
                Pelanggan
              </Link>
              <Link href="/admin/diskon" className={`${pathname.includes('/admin/diskon') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/diskon') ? 'icon-fill' : ''}`}>confirmation_number</span>
                Diskon & Promo
              </Link>
              <Link href="/admin/banner" className={`${pathname.includes('/admin/banner') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/banner') ? 'icon-fill' : ''}`}>photo_library</span>
                Banner
              </Link>
              <div className="my-2 border-t border-admin-outline-variant/30 mx-2"></div>
              <Link href="/admin/pengaturan" className={`${pathname.includes('/admin/pengaturan') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/pengaturan') ? 'icon-fill' : ''}`}>settings</span>
                Pengaturan Toko
              </Link>
              <Link href="/admin/profil" className={`${pathname.includes('/admin/profil') ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'text-admin-on-surface-variant hover:text-admin-primary hover:bg-admin-surface-container'} rounded-xl px-4 py-3 flex items-center gap-4 font-label-md transition-all group`}>
                <span className={`material-symbols-outlined ${pathname.includes('/admin/profil') ? 'icon-fill' : ''}`}>manage_accounts</span>
                Profile
              </Link>
            </nav>
          </aside>
        )}

        {/* Main Content Wrapper */}
        <div className={`flex-1 flex flex-col w-full min-h-screen max-w-full min-w-0 ${pathname === '/admin/mobile-produk' ? '' : 'md:ml-72'}`}>
          
          {/* Top App Bar */}
          {pathname !== '/admin/mobile-produk' && (
            <header className="sticky top-0 flex items-center justify-between px-4 sm:px-6 h-16 bg-admin-background/80 backdrop-blur-xl z-30 border-b border-admin-outline-variant/10">
              <div className="flex items-center gap-3">
                {/* 🔥 Tombol menu hamburger aktif buka sidebar */}
                <button 
                  onClick={() => setIsMobileMenuOpen(true)} 
                  className="md:hidden text-admin-primary p-2 rounded-full hover:bg-admin-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="font-headline-md text-admin-primary line-clamp-1">
                  {pathname === '/admin' ? 'Admin AlfaShop' : 
                   pathname.includes('produk') ? 'Products' :
                   pathname.includes('pesanan') ? 'Orders' :
                   pathname.includes('kasir') ? 'POS' :
                   pathname.includes('laporan') ? 'Reports' :
                   pathname.includes('pelanggan') ? 'Pelanggan' :
                   pathname.includes('diskon') ? 'Diskon & Promo' :
                   pathname.includes('banner') ? 'Banner' :
                   pathname.includes('pengaturan') ? 'Pengaturan Toko' : 'AlfaShop'}
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {/* 🔥 FITUR NOTIFIKASI DITARUH DI SINI */}
                <NotifAdmin />
                
                <div className="h-6 w-px bg-admin-outline-variant/30 hidden sm:block mx-1"></div>

                <button onClick={handleLogout} className="text-admin-on-surface-variant hover:text-admin-error transition-colors items-center gap-2 font-label-md hidden sm:flex">
                  <span className="material-symbols-outlined">logout</span>
                  <span>Logout</span>
                </button>
                
                <Link href="/admin/profil" className="w-9 h-9 bg-admin-surface rounded-full border border-admin-outline-variant/30 flex items-center justify-center shadow-sm hover:ring-2 hover:ring-admin-primary/30 transition-all text-admin-primary ml-1 sm:ml-0">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </Link>
              </div>
            </header>
          )}

          {/* Main Canvas */}
          <main className={`flex-1 overflow-x-hidden ${pathname === '/admin/mobile-produk' ? 'p-0' : 'p-4 sm:p-6'}`}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}