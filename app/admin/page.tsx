'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [omzetHariIni, setOmzetHariIni] = useState(0);
  const [pesananBaru, setPesananBaru] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // FRONTEND: Meminta data ke Backend API
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      
      if (res.ok) {
        setIsOpen(data.isOpen);
        setOmzetHariIni(data.omzet || 0);
        setPesananBaru(data.pesananBaru || 0);
      } else {
        console.error("API error response:", data.error);
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // FRONTEND: Mengirim perintah buka/tutup toko ke Backend API
  const handleToggleToko = async () => {
    const statusBaru = !isOpen;
    setIsOpen(statusBaru); // Ubah UI langsung biar terasa cepat (Optimistic UI)
    
    try {
      await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_open: statusBaru })
      });
    } catch (error) {
      console.error("Gagal update status toko:", error);
      setIsOpen(!statusBaru); // Kembalikan seperti semula kalau error
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-10">
      {/* Greeting */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[28px] font-bold text-admin-on-surface tracking-tight">Halo, Admin!</h2>
        <p className="font-body-md text-admin-on-surface-variant">Berikut adalah ringkasan performa toko Anda hari ini.</p>
      </section>

      {/* Store Status Widget */}
      <section>
        <div className="relative overflow-hidden bg-admin-secondary-container rounded-[32px] p-8 md:p-10 border border-admin-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Background blobs */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-admin-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-admin-tertiary/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-admin-primary animate-pulse shadow-[0_0_8px_rgba(195,250,227,0.6)]' : 'bg-admin-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.6)]'}`}></span>
              <h3 className={`font-label-md uppercase tracking-widest text-sm ${isOpen ? 'text-admin-primary' : 'text-admin-error'}`}>
                {isLoading ? 'Mengecek Status...' : (isOpen ? 'Toko Buka' : 'Toko Tutup')}
              </h3>
            </div>
            <p className="font-body-lg text-admin-on-secondary-container max-w-[32rem] leading-relaxed">
              {isOpen ? 'Pelanggan bisa memesan dan melihat katalog produk Anda secara langsung dari aplikasi atau website.' : 'Toko sedang tutup. Pelanggan tidak bisa memesan secara online untuk sementara waktu.'}
            </p>
          </div>

          {/* Modern Toggle Switch */}
          <div className="relative z-10 flex-shrink-0 cursor-pointer group" onClick={handleToggleToko}>
            <div className={`w-[110px] h-[54px] rounded-full p-1.5 flex items-center transition-all duration-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ${isOpen ? 'bg-admin-primary' : 'bg-admin-surface-container-highest'}`}>
              <div className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-500 ease-out group-hover:scale-105 ${isOpen ? 'bg-admin-on-primary translate-x-12' : 'bg-admin-on-surface-variant translate-x-0'}`}>
                <span className={`material-symbols-outlined text-[24px] ${isOpen ? 'text-admin-primary' : 'text-admin-surface-container-highest'}`}>storefront</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Omzet */}
        <div className="bg-admin-surface-container-low rounded-[24px] p-8 border border-admin-outline-variant/30 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-admin-on-surface-variant uppercase tracking-wider text-[12px]">Omzet Hari Ini</span>
            <div className="flex flex-col">
              <span className="font-display-lg text-admin-on-surface text-3xl md:text-4xl">
                {isLoading ? '...' : `Rp ${omzetHariIni.toLocaleString('id-ID')}`}
              </span>
              <div className="mt-2 inline-flex items-center gap-1.5 text-admin-primary font-bold bg-admin-primary/10 px-3 py-1 rounded-full text-sm w-fit">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                Real-time
              </div>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-admin-tertiary/20 flex items-center justify-center text-admin-tertiary">
            <span className="material-symbols-outlined text-[32px] icon-fill">payments</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-admin-surface-container-low rounded-[24px] p-8 border border-admin-outline-variant/30 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-admin-on-surface-variant uppercase tracking-wider text-[12px]">Pesanan Baru</span>
            <div className="flex flex-col">
              <span className="font-display-lg text-admin-on-surface text-3xl md:text-4xl">
                {isLoading ? '...' : pesananBaru}
              </span>
              <span className="mt-2 text-admin-on-surface-variant font-medium text-sm">Menunggu diproses oleh tim</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-admin-primary/20 flex items-center justify-center text-admin-primary">
            <span className="material-symbols-outlined text-[32px] icon-fill">shopping_bag</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex flex-col gap-6">
        <h3 className="font-headline-md text-admin-on-surface">Aksi Cepat</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/kasir" className="group bg-admin-surface-container-low hover:bg-admin-surface-container-high hover:shadow-xl hover:shadow-admin-primary/5 transition-all duration-300 rounded-[24px] p-8 flex flex-col items-center gap-5 border border-admin-outline-variant/30 hover:border-admin-primary/30">
            <div className="w-16 h-16 rounded-2xl bg-admin-surface-container-highest group-hover:bg-admin-primary transition-colors duration-300 flex items-center justify-center text-admin-primary group-hover:text-admin-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px]">point_of_sale</span>
            </div>
            <span className="font-label-md text-admin-on-surface group-hover:text-admin-primary transition-colors">Kasir Offline</span>
          </Link>
          <Link href="/admin/produk" className="group bg-admin-surface-container-low hover:bg-admin-surface-container-high hover:shadow-xl hover:shadow-admin-primary/5 transition-all duration-300 rounded-[24px] p-8 flex flex-col items-center gap-5 border border-admin-outline-variant/30 hover:border-admin-primary/30">
            <div className="w-16 h-16 rounded-2xl bg-admin-surface-container-highest group-hover:bg-admin-primary transition-colors duration-300 flex items-center justify-center text-admin-primary group-hover:text-admin-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>
            <span className="font-label-md text-admin-on-surface group-hover:text-admin-primary transition-colors">Kelola Produk</span>
          </Link>
          <Link href="/admin/pesanan" className="group bg-admin-surface-container-low hover:bg-admin-surface-container-high hover:shadow-xl hover:shadow-admin-primary/5 transition-all duration-300 rounded-[24px] p-8 flex flex-col items-center gap-5 border border-admin-outline-variant/30 hover:border-admin-primary/30">
            <div className="w-16 h-16 rounded-2xl bg-admin-surface-container-highest group-hover:bg-admin-primary transition-colors duration-300 flex items-center justify-center text-admin-primary group-hover:text-admin-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px]">storefront</span>
            </div>
            <span className="font-label-md text-admin-on-surface group-hover:text-admin-primary transition-colors">Pesanan Online</span>
          </Link>
          <Link href="/admin/laporan" className="group bg-admin-surface-container-low hover:bg-admin-surface-container-high hover:shadow-xl hover:shadow-admin-primary/5 transition-all duration-300 rounded-[24px] p-8 flex flex-col items-center gap-5 border border-admin-outline-variant/30 hover:border-admin-primary/30">
            <div className="w-16 h-16 rounded-2xl bg-admin-surface-container-highest group-hover:bg-admin-primary transition-colors duration-300 flex items-center justify-center text-admin-primary group-hover:text-admin-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px]">bar_chart</span>
            </div>
            <span className="font-label-md text-admin-on-surface group-hover:text-admin-primary transition-colors text-center leading-tight">Laporan & Analitik</span>
          </Link>
        </div>
      </section>
    </main>
  );
}