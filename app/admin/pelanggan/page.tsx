'use client';
import { useState, useEffect } from 'react';

export default function ManajemenPelangganPage() {
  const [pelangganList, setPelangganList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchPelanggan();
  }, [debouncedSearch]);

  const fetchPelanggan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/pelanggan?search=${encodeURIComponent(debouncedSearch)}`);
      const data = await res.json();
      setPelangganList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  const formatTanggal = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const openWA = (wa: string) => {
    const clean = (wa || '').replace(/^0/, '62').replace(/\D/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  // Top 3 spender
  const topSpenderIds = pelangganList.slice(0, 3).map((p) => p.id);

  const totalPelanggan = pelangganList.length;
  const totalOmzet = pelangganList.reduce((s, p) => s + Number(p.total_belanja), 0);
  const avgBelanja = totalPelanggan > 0 ? totalOmzet / totalPelanggan : 0;

  return (
    <div className="w-full text-admin-on-surface font-body-md">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Manajemen Pelanggan</h2>
          <p className="text-admin-on-surface-variant mt-1 text-sm">
            Lihat daftar pelanggan, histori belanja, dan hubungi via WhatsApp.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Pelanggan', value: totalPelanggan, icon: 'group', color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
          { label: 'Total Omzet Pelanggan', value: formatRupiah(totalOmzet), icon: 'payments', color: 'text-admin-tertiary', bg: 'bg-admin-tertiary/10' },
          { label: 'Rata-rata Belanja', value: formatRupiah(avgBelanja), icon: 'trending_up', color: 'text-admin-secondary', bg: 'bg-admin-secondary/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-admin-surface-container-low rounded-2xl p-5 border border-admin-outline-variant/30 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-[26px] icon-fill">{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs text-admin-on-surface-variant uppercase tracking-wider font-medium">{stat.label}</p>
              <p className="text-lg font-bold text-admin-on-surface mt-0.5">{isLoading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-admin-surface-container/60 backdrop-blur-xl border border-admin-outline-variant/30 rounded-2xl p-4 mb-6">
        <div className="relative w-full sm:w-80 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[20px] group-focus-within:text-admin-primary transition-colors">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau WA..."
            className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 text-admin-on-surface rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary focus:outline-none transition-all placeholder:text-admin-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-surface-container-low/30 rounded-2xl border border-admin-surface-container-high overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-admin-surface-container-high/50 text-admin-on-surface-variant text-xs uppercase tracking-wider font-semibold border-b border-admin-surface-container-high">
                <th className="p-4">#</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Kontak</th>
                <th className="p-4 text-center">Total Pesanan</th>
                <th className="p-4 text-right">Total Belanja</th>
                <th className="p-4">Bergabung</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-admin-surface-container-high">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-admin-on-surface-variant animate-pulse">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : pelangganList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-admin-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 text-admin-outline-variant block">group</span>
                    Tidak ada pelanggan ditemukan.
                  </td>
                </tr>
              ) : (
                pelangganList.map((pelanggan, idx) => {
                  const isTop = topSpenderIds.includes(pelanggan.id);
                  const inisial = (pelanggan.name || 'P').substring(0, 2).toUpperCase();

                  return (
                    <tr key={pelanggan.id} className="hover:bg-admin-surface-container transition-colors group">
                      <td className="p-4 text-admin-on-surface-variant font-medium">{idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-admin-primary/20 text-admin-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {inisial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-admin-on-surface">{pelanggan.name}</p>
                              {isTop && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                  <span className="material-symbols-outlined text-[12px] icon-fill">star</span>
                                  Top Spender
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-admin-on-surface-variant">{pelanggan.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-admin-on-surface-variant text-sm">{pelanggan.whatsapp || '-'}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-medium text-admin-on-surface">{pelanggan.total_pesanan}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-bold ${isTop ? 'text-amber-400' : 'text-admin-on-surface'}`}>
                          {formatRupiah(pelanggan.total_belanja)}
                        </span>
                      </td>
                      <td className="p-4 text-admin-on-surface-variant">{formatTanggal(pelanggan.created_at)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          {pelanggan.whatsapp ? (
                            <button
                              onClick={() => openWA(pelanggan.whatsapp)}
                              title="Hubungi via WhatsApp"
                              className="flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-[#25D366]/20"
                            >
                              <span className="material-symbols-outlined text-[16px]">chat</span>
                              WhatsApp
                            </button>
                          ) : (
                            <span className="text-xs text-admin-on-surface-variant italic">No WA</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-admin-surface-container-high bg-admin-surface-container-lowest flex items-center justify-between">
          <p className="text-xs text-admin-on-surface-variant">
            Menampilkan <span className="font-semibold text-admin-on-surface">{pelangganList.length}</span> pelanggan
          </p>
          <div className="flex items-center gap-1 text-xs text-admin-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-amber-400 icon-fill">star</span>
            3 teratas = Top Spender
          </div>
        </div>
      </div>
    </div>
  );
}
