'use client';
import { useState, useEffect } from 'react';
import { Search, Bell, Clock, MessageCircle, Truck, CheckCheck, RefreshCw, ReceiptText, Printer, FileText, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PesananAdminPage() {
  const [pesananList, setPesananList] = useState<any[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. FRONTEND: Ambil Data Pesanan dari API
  const fetchPesanan = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true); 
    try {
      const res = await fetch(`/api/admin/pesanan?t=${new Date().getTime()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPesananList(data);
      } else {
        console.error("API Error:", data.error);
        setPesananList([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data pesanan:", error);
      setPesananList([]);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => { fetchPesanan(); }, []);

  // 2. FRONTEND: Fungsi Ubah Status (Super Optimistic UI Anti-Kedip)
  const updateStatus = async (id: any, statusBaru: string) => {
    if (!window.confirm(`Tandai pesanan ini menjadi "${statusBaru}"?`)) return;

    const backupPesanan = [...pesananList];

    setPesananList((prevList) => 
      prevList.map(p => p.id.toString() === id.toString() ? { ...p, status: statusBaru } : p)
    );

    try {
      const res = await fetch('/api/admin/pesanan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: statusBaru }),
      });

      if (!res.ok) {
        alert('Gagal mengupdate status pesanan di database.');
        setPesananList(backupPesanan);
      }
    } catch (error) {
      console.error("Error update status:", error);
      alert('Terjadi kesalahan jaringan.');
      setPesananList(backupPesanan); 
    }
  };

  // 3. Hitung & Filter Data
  const filteredPesanan = pesananList.filter((p) => {
    let pStatus = (p.status || '').trim().toLowerCase();
    if (pStatus === '') pStatus = 'menunggu';

    const fStatus = filter.trim().toLowerCase();
    const matchStatus = filter === 'Semua' ? true : pStatus === fStatus;
    const matchSearch = p.nama_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString().toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    Semua: pesananList.length,
    Menunggu: pesananList.filter(p => {
      const s = (p.status || '').trim().toLowerCase();
      return s === 'menunggu' || s === '';
    }).length,
    Diproses: pesananList.filter(p => (p.status || '').trim().toLowerCase() === 'diproses').length,
    Dikirim: pesananList.filter(p => (p.status || '').trim().toLowerCase() === 'dikirim').length,
    "Siap Diambil": pesananList.filter(p => (p.status || '').trim().toLowerCase() === 'siap diambil').length,
    Selesai: pesananList.filter(p => (p.status || '').trim().toLowerCase() === 'selesai').length,
  };

  const getStatusStyle = (status: string) => {
    let s = (status || '').trim().toLowerCase();
    if (s === '') s = 'menunggu';

    if (s === 'menunggu') return {
      badge: 'bg-admin-tertiary-container/20 text-admin-tertiary border-admin-tertiary-container/30',
      dot: 'bg-admin-tertiary',
      label: 'Menunggu'
    };
    if (s === 'diproses') return {
      badge: 'bg-admin-secondary-container/20 text-admin-secondary border-admin-secondary-container/50',
      dot: 'bg-admin-secondary animate-pulse',
      label: 'Diproses'
    };
    if (s === 'dikirim' || s === 'siap diambil') return {
      badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      dot: 'bg-blue-500',
      label: s === 'dikirim' ? 'Dikirim' : 'Siap Diambil'
    };
    return {
      badge: 'bg-admin-primary/10 text-admin-primary border-admin-primary/20',
      dot: '',
      label: 'Selesai'
    };
  };

  return (
    <main className="flex-1 p-6 md:p-12 w-full max-w-[1440px] mx-auto flex flex-col font-body-md text-admin-on-surface">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-admin-on-surface tracking-tight mb-2">Manajemen Pesanan</h1>
          <p className="text-sm font-medium text-admin-on-surface-variant">Lacak, kelola, dan proses pesanan pelanggan di semua saluran.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={() => alert('Fitur Ekspor CSV akan segera hadir!')} className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-admin-outline-variant/30 text-admin-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-admin-surface-container-highest transition-colors shadow-sm">
            <Download size={18} />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Header Search & Refersh (Additional) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant" size={18} />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-admin-surface-container-high border border-admin-outline-variant/50 rounded-lg py-2.5 pl-10 pr-4 text-sm font-semibold text-admin-on-surface placeholder:text-admin-on-surface-variant focus:outline-none focus:border-admin-primary-container focus:ring-1 focus:ring-admin-primary-container transition-all" 
            placeholder="Cari pesanan atau pelanggan..."
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button onClick={() => fetchPesanan(false)} className="px-4 py-2.5 rounded-lg bg-admin-surface-container hover:bg-admin-surface-container-high text-admin-on-surface font-bold text-sm flex items-center justify-center transition-colors border border-admin-outline-variant/30" title="Segarkan Data">
            <RefreshCw size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['Semua', 'Menunggu', 'Diproses', 'Dikirim', 'Siap Diambil', 'Selesai'].map((tab) => {
          const isActive = filter === tab;
          const displayTab = tab === 'Semua' ? 'Semua Pesanan' : tab;
          return (
            <button 
              key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${
                isActive 
                  ? 'bg-admin-primary-container text-admin-on-primary-container border-transparent shadow-[0_0_15px_rgba(167,221,199,0.1)]' 
                  : 'bg-admin-surface-container text-admin-on-surface-variant hover:bg-admin-surface-container-highest border-transparent hover:border-admin-outline-variant/50'
              }`}
            >
              {displayTab} <span className="ml-2 opacity-70 font-semibold">{counts[tab as keyof typeof counts]}</span>
            </button>
          )
        })}
      </div>

      {/* Data Table Card */}
      <div className="bg-admin-surface-container rounded-xl overflow-hidden border border-admin-surface-container-highest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-admin-surface-container-high border-b border-admin-surface-container-highest">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">ID Pesanan</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Pelanggan</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Ringkasan Item</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider text-right">Total Harga</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-surface-container-highest">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-admin-on-surface-variant font-semibold animate-pulse">Memuat data pesanan...</td>
                </tr>
              ) : filteredPesanan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-admin-on-surface-variant font-semibold">Tidak ada pesanan yang sesuai.</td>
                </tr>
              ) : filteredPesanan.map((order) => {
                const shortId = `#ORD-${order.id.toString().padStart(4, '0')}`;
                const dateObj = new Date(order.created_at);
                const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                const style = getStatusStyle(order.status);
                const inisial = order.nama_pelanggan.substring(0, 2).toUpperCase();
                
                // Ringkasan Item
                let itemsSummary = "-";
                if (order.item_pesanan && order.item_pesanan.length > 0) {
                  const firstItem = order.item_pesanan[0].name;
                  const moreCount = order.item_pesanan.length - 1;
                  itemsSummary = moreCount > 0 ? `${firstItem} + ${moreCount} lainnya` : firstItem;
                }

                // Cek apakah hari ini
                const isToday = new Date().toDateString() === dateObj.toDateString();
                const displayDate = isToday ? `Hari ini, ${timeString} WIB` : `${dateString}, ${timeString} WIB`;

                const rawStatus = (order.status || '').trim().toLowerCase() || 'menunggu';

                return (
                  <tr key={order.id} className="hover:bg-admin-surface-container-high transition-colors group">
                    <td className="py-4 px-6 text-sm text-admin-on-surface font-bold">{shortId}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-surface-container-highest text-admin-on-surface flex items-center justify-center text-xs font-bold border border-admin-outline-variant/30 shrink-0">
                          {inisial}
                        </div>
                        <span className="text-sm font-semibold text-admin-on-surface line-clamp-1">{order.nama_pelanggan}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-admin-on-surface-variant">{displayDate}</td>
                    <td className="py-4 px-6 text-sm font-medium text-admin-on-surface-variant max-w-[200px] truncate" title={itemsSummary}>{itemsSummary}</td>
                    <td className="py-4 px-6 text-sm text-admin-on-surface text-right font-bold tracking-tight">Rp {order.total_harga.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                        {rawStatus === 'selesai' ? (
                          <CheckCheck size={12} className="shrink-0" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                        )}
                        {style.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`https://wa.me/62${(order.whatsapp || '').replace(/^0/, '')}?text=Halo%20${order.nama_pelanggan},%20pesanan%20${shortId}%20sedang%20kami%20proses.`}
                          target="_blank" rel="noreferrer"
                          className="p-2 rounded-md hover:bg-admin-surface-container-highest text-admin-primary-container transition-colors"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>
                        <button 
                          onClick={() => {
                            const notaUrl = `${window.location.origin}/nota?id=${order.id}`;
                            const text = `Halo ${order.nama_pelanggan}, ini adalah struk digital pesanan Anda.\nTotal: Rp ${order.total_harga.toLocaleString('id-ID')}.\n\nLihat nota lengkap: ${notaUrl}\n\nTerima kasih telah berbelanja di AlfaShop!`;
                            window.open(`https://wa.me/62${(order.whatsapp || '').replace(/^0/, '')}?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="p-2 rounded-md hover:bg-admin-surface-container-highest text-green-600 transition-colors"
                          title="Kirim Struk Digital ke WhatsApp"
                        >
                          <ReceiptText size={18} />
                        </button>
                        <button 
                          onClick={() => window.open(`/nota?id=${order.id}`, '_blank')}
                          className="p-2 rounded-md hover:bg-admin-surface-container-highest text-admin-on-surface-variant transition-colors"
                          title="Cetak Struk Thermal"
                        >
                          <Printer size={18} />
                        </button>
                        <Link
                          href={`/admin/pesanan/${order.id}`}
                          className="p-2 rounded-md hover:bg-admin-surface-container-highest text-admin-on-surface-variant transition-colors"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye size={18} />
                        </Link>
                        {rawStatus === 'menunggu' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'Diproses')}
                            className="px-3 py-1.5 ml-1 rounded-md border border-admin-primary/50 text-admin-on-primary-container bg-admin-primary hover:bg-admin-primary-fixed transition-colors text-xs font-bold shadow-sm"
                          >
                            Proses
                          </button>
                        )}
                        {rawStatus === 'diproses' && (
                          <div className="flex items-center gap-1 ml-1">
                            <button 
                              onClick={() => updateStatus(order.id, 'Dikirim')}
                              className="px-3 py-1.5 rounded-md border border-blue-500/50 text-white bg-blue-500 hover:bg-blue-600 transition-colors text-xs font-bold shadow-sm"
                            >
                              Kurir
                            </button>
                            <button 
                              onClick={() => updateStatus(order.id, 'Siap Diambil')}
                              className="px-3 py-1.5 rounded-md border border-purple-500/50 text-white bg-purple-500 hover:bg-purple-600 transition-colors text-xs font-bold shadow-sm"
                            >
                              Toko
                            </button>
                          </div>
                        )}
                        {(rawStatus === 'dikirim' || rawStatus === 'siap diambil') && (
                          <button 
                            onClick={() => updateStatus(order.id, 'Selesai')}
                            className="px-3 py-1.5 ml-1 rounded-md border border-green-500/50 text-white bg-green-500 hover:bg-green-600 transition-colors text-xs font-bold shadow-sm"
                          >
                            Selesaikan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && filteredPesanan.length > 0 && (
          <div className="px-6 py-4 bg-admin-surface-container-low border-t border-admin-surface-container-highest flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-admin-on-surface-variant">Menampilkan {filteredPesanan.length} pesanan</span>
            <div className="flex gap-1">
              <button onClick={() => alert('Halaman sebelumnya')} className="p-2 rounded-lg hover:bg-admin-surface-container-highest text-admin-on-surface-variant transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="w-10 h-10 rounded-lg bg-admin-surface-container-highest text-admin-on-surface font-bold text-sm flex items-center justify-center">1</button>
              <button onClick={() => alert('Halaman selanjutnya')} className="p-2 rounded-lg hover:bg-admin-surface-container-highest text-admin-on-surface-variant transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}