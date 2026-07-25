'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RiwayatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    // Kita gunakan API /nota/[id] yang sudah ada untuk mengambil detail pesanan
    fetch(`/nota/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setOrder(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="bg-[#fef7ff] dark:bg-[#0f172a] min-h-screen flex items-center justify-center transition-colors">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#7c3aed] dark:text-[#c084fc]">progress_activity</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#fef7ff] dark:bg-[#0f172a] min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors">
        <span className="material-symbols-outlined text-6xl text-[#ccc3d8] dark:text-slate-600 mb-4">search_off</span>
        <h1 className="text-2xl font-bold text-[#1d1a24] dark:text-slate-100 mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-[#4a4455] dark:text-slate-400 mb-6">Maaf, data pesanan yang Anda cari tidak ada atau sudah dihapus.</p>
        <button onClick={() => router.back()} className="bg-[#630ed4] dark:bg-[#c084fc] text-white dark:text-slate-900 px-6 py-3 rounded-xl font-semibold transition-colors hover:opacity-90">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const isWaiting = order.status === 'Menunggu' || order.status === 'Proses';
  const isCompleted = order.status === 'Selesai';
  const isCanceled = order.status === 'Dibatalkan' || order.status === 'Batal';
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('id-ID', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  }) : '';

  let statusBg = 'bg-[#eaddff] dark:bg-purple-900/40';
  let statusText = 'text-[#25005a] dark:text-[#c084fc]';
  let statusIcon = '';

  if (isWaiting) {
    statusBg = 'bg-[#ffdcc6] dark:bg-orange-950/50';
    statusText = 'text-[#713700] dark:text-orange-400';
  } else if (isCompleted) {
    statusBg = 'bg-[#e8dfee] dark:bg-emerald-950/30';
    statusText = 'text-[#4a4455] dark:text-emerald-400';
    statusIcon = 'check_circle';
  } else if (isCanceled) {
    statusBg = 'bg-[#ffdad6] dark:bg-red-950/50';
    statusText = 'text-[#93000a] dark:text-red-400';
    statusIcon = 'cancel';
  }

  return (
    <div className="bg-[#fef7ff] dark:bg-[#0f172a] text-[#1d1a24] dark:text-slate-100 min-h-screen flex flex-col pb-10 pt-16 transition-colors duration-300">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full flex items-center px-6 h-16 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-[#ffe4e6] dark:border-slate-700/80 shadow-[0_4px_20px_rgba(124,58,237,0.03)] dark:shadow-none z-50 transition-colors">
        <button onClick={() => router.back()} className="text-[#7c3aed] dark:text-[#c084fc] hover:bg-[#fff1f2] dark:hover:bg-slate-800 transition-colors rounded-full p-2 active:scale-95 flex items-center justify-center mr-4">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-xl text-[#1d1a24] dark:text-slate-100">
          Detail Pesanan
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 md:px-20 py-10 max-w-3xl">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-[#ccc3d8] dark:border-slate-700/80 overflow-hidden transition-colors">
          {/* Header Card */}
          <div className="p-6 border-b border-[#ccc3d8] dark:border-slate-700/80 bg-[#f9f1ff] dark:bg-[#1e293b] transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-sm font-medium text-[#7b7487] dark:text-slate-400">ID Pesanan</h2>
                <div className="text-xl font-bold text-[#1d1a24] dark:text-slate-100">#AS-{order.id.toString().padStart(4, '0')}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full ${statusBg} ${statusText} text-sm font-medium`}>
                {statusIcon && <span className="material-symbols-outlined text-[16px] mr-1.5">{statusIcon}</span>}
                {!statusIcon && <span className="w-2 h-2 rounded-full bg-current mr-2"></span>}
                {order.status}
              </span>
            </div>
            <div className="flex items-center text-[#4a4455] dark:text-slate-300 text-sm gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              {dateStr}
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-[#ccc3d8] dark:border-slate-700/80 transition-colors">
            <h3 className="font-semibold text-[#1d1a24] dark:text-slate-100 mb-4 text-lg">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#7b7487] dark:text-slate-400 mb-1">Nama Pemesan</div>
                <div className="font-medium text-[#1d1a24] dark:text-slate-200">{order.nama_pelanggan || '-'}</div>
              </div>
              <div>
                <div className="text-[#7b7487] dark:text-slate-400 mb-1">Nomor WhatsApp</div>
                <div className="font-medium text-[#1d1a24] dark:text-slate-200">{order.whatsapp || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[#7b7487] dark:text-slate-400 mb-1">Catatan Tambahan</div>
                <div className="font-medium text-[#1d1a24] dark:text-slate-200">{order.catatan || 'Tidak ada catatan'}</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-[#ccc3d8] dark:border-slate-700/80 transition-colors">
            <h3 className="font-semibold text-[#1d1a24] dark:text-slate-100 mb-4 text-lg">Daftar Belanjaan</h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f3ebfa] dark:bg-slate-800 text-[#630ed4] dark:text-[#c084fc] flex items-center justify-center font-bold text-sm shrink-0">
                        {item.jumlah || item.qty}x
                      </div>
                      <div>
                        <div className="font-medium text-[#1d1a24] dark:text-slate-100">{item.nama_produk}</div>
                        <div className="text-sm text-[#7b7487] dark:text-slate-400">Rp {(item.subtotal / (item.jumlah || item.qty)).toLocaleString('id-ID')} / item</div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#1d1a24] dark:text-slate-100">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#7b7487] dark:text-slate-400 text-sm">Tidak ada detail barang</div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 bg-[#fef7ff] dark:bg-[#1e293b] transition-colors">
            <div className="flex justify-between items-center text-lg">
              <div className="font-semibold text-[#4a4455] dark:text-slate-300">Total Belanja</div>
              <div className="font-bold text-[#630ed4] dark:text-[#c084fc] text-xl">
                Rp {order.total_harga?.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Print Receipt Button */}
        <div className="mt-6 flex justify-end">
          <Link href={`/nota?id=${order.id}`} className="flex items-center gap-2 bg-[#630ed4] dark:bg-[#c084fc] hover:bg-[#732ee4] dark:hover:bg-[#a855f7] text-white dark:text-slate-900 px-6 py-3 rounded-xl font-semibold transition-colors active:scale-95">
            <span className="material-symbols-outlined">receipt_long</span>
            Cetak Struk
          </Link>
        </div>
      </main>
    </div>
  );
}
