'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, CheckCircle, XCircle, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const idPesanan = params.id;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/admin/pesanan?id=${idPesanan}`);
        if (!res.ok) throw new Error('Gagal mengambil data pesanan');
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (idPesanan) {
      fetchDetail();
    }
  }, [idPesanan]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan menjadi ${newStatus}?`)) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/pesanan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idPesanan, status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Gagal memperbarui status');
      
      setOrder({ ...order, status: newStatus });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="animate-spin text-admin-primary" size={40} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[500px]">
        <XCircle className="text-admin-error mb-4" size={48} />
        <h2 className="text-xl font-bold text-admin-on-surface">Pesanan Tidak Ditemukan</h2>
        <p className="text-admin-on-surface-variant mt-2">{error}</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-admin-surface-container-high text-admin-on-surface rounded-lg font-bold hover:bg-admin-surface-container-highest transition-colors">
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  let statusColor = 'bg-admin-surface-container text-admin-on-surface-variant border-admin-outline-variant/30';
  if (order.status === 'Menunggu') statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  if (order.status === 'Diproses') statusColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (order.status === 'Selesai') statusColor = 'bg-admin-primary/10 text-admin-primary border-admin-primary/20';

  const StatusIcon = 
    order.status === 'Menunggu' ? Clock :
    order.status === 'Diproses' ? Package :
    CheckCheck;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 pb-10 w-full animate-fade-in font-body-md text-admin-on-surface">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-admin-surface-container-lowest text-admin-primary rounded-full flex items-center justify-center hover:bg-admin-surface-container-low shadow-sm border border-admin-outline-variant/30 transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-admin-on-surface flex items-center gap-2">
              Pesanan <span className="text-admin-primary">#{order.id.toString().padStart(4, '0')}</span>
            </h1>
            <p className="text-sm text-admin-on-surface-variant mt-1 font-medium">
              {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-sm shadow-sm w-fit ${statusColor}`}>
          <StatusIcon size={16} />
          {order.status || 'Menunggu'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Detail Pelanggan & Pengiriman */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Card Pelanggan */}
          <div className="bg-admin-surface-container-lowest p-6 rounded-2xl shadow-sm border border-admin-outline-variant/30 hover:shadow-md transition-shadow hover:border-admin-primary/50">
            <div className="flex items-center gap-3 text-admin-primary mb-4 pb-3 border-b border-admin-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <User size={18} />
              </div>
              <h2 className="text-base font-bold text-admin-on-surface">Pelanggan</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black text-admin-outline uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="font-bold text-admin-on-surface">{order.nama_pelanggan}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-admin-outline uppercase tracking-wider mb-1">No. WhatsApp</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-admin-on-surface">{order.whatsapp || '-'}</p>
                  {order.whatsapp && (
                    <a 
                      href={`https://wa.me/62${order.whatsapp.replace(/^0/, '')}?text=Halo%20${order.nama_pelanggan},%20terkait%20pesanan%20Anda...`}
                      target="_blank" rel="noreferrer"
                      className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-md hover:bg-[#10b981]/20 transition-colors border border-[#10b981]/20"
                    >
                      Chat WA
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Pengiriman */}
          <div className="bg-admin-surface-container-lowest p-6 rounded-2xl shadow-sm border border-admin-outline-variant/30 hover:shadow-md transition-shadow hover:border-admin-primary/50">
            <div className="flex items-center gap-3 text-admin-primary mb-4 pb-3 border-b border-admin-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h2 className="text-base font-bold text-admin-on-surface">Pengiriman</h2>
            </div>
            <div>
              <p className="text-[10px] font-black text-admin-outline uppercase tracking-wider mb-1">Alamat Lengkap</p>
              <p className="font-medium text-admin-on-surface leading-relaxed text-sm">
                {order.alamat}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Barang & Total */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-admin-surface-container-lowest p-6 rounded-2xl shadow-sm border border-admin-outline-variant/30 hover:shadow-md transition-shadow hover:border-admin-primary/50">
            <div className="flex items-center gap-3 text-admin-primary mb-6 pb-4 border-b border-admin-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <Package size={18} />
              </div>
              <h2 className="text-lg font-bold text-admin-on-surface">Daftar Barang</h2>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {order.item_pesanan?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-admin-surface-container-low transition-colors border border-transparent hover:border-admin-outline-variant/30">
                  <div className="w-16 h-16 bg-admin-surface-container-high rounded-lg overflow-hidden shrink-0 border border-admin-outline-variant/30">
                    {item.gambar ? (
                      <img src={item.gambar} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-admin-outline">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-admin-on-surface truncate">{item.name}</h3>
                    <p className="text-sm font-medium text-admin-on-surface-variant mt-1">Rp {item.price.toLocaleString('id-ID')} <span className="mx-1 text-admin-outline">x</span> <span className="font-bold text-admin-primary">{item.quantity}</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-admin-on-surface">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-dashed border-admin-outline-variant/50">
              <div className="flex justify-between items-center mb-2 text-sm font-medium text-admin-on-surface-variant">
                <span>Subtotal ({order.item_pesanan?.reduce((acc: number, item: any) => acc + item.quantity, 0)} barang)</span>
                <span className="text-admin-on-surface font-bold">Rp {order.total_harga?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-sm font-medium text-admin-on-surface-variant">
                <span>Ongkos Kirim</span>
                <span className="text-[#10b981] font-bold">Gratis</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-admin-primary/5 rounded-xl border border-admin-primary/20">
                <span className="font-bold text-admin-on-surface">Total Pembayaran</span>
                <span className="text-xl font-black text-admin-primary">Rp {order.total_harga?.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          {(!order.status || order.status === 'Menunggu') && (
            <div className="bg-admin-surface-container-lowest p-5 rounded-2xl shadow-sm border border-admin-outline-variant/30 flex gap-3">
              <button 
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('Diproses')}
                className="flex-1 bg-admin-primary text-admin-on-primary py-3.5 rounded-xl font-bold hover:bg-admin-primary/80 transition-all hover:shadow-lg hover:shadow-admin-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                Terima & Proses Pesanan
              </button>
            </div>
          )}
          
          {order.status === 'Diproses' && (
            <div className="bg-admin-surface-container-lowest p-5 rounded-2xl shadow-sm border border-admin-outline-variant/30 flex gap-3">
              <button 
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('Selesai')}
                className="flex-1 bg-admin-secondary text-admin-on-secondary py-3.5 rounded-xl font-bold hover:bg-admin-secondary/80 transition-all hover:shadow-lg hover:shadow-admin-secondary/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <CheckCheck size={20} />}
                Selesaikan Pesanan
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Scrollbar Custom Gelap */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-admin-surface-container); 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-admin-outline-variant); 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-admin-outline); 
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
