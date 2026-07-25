'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DetailProdukPage() {
  const params = useParams();
  const router = useRouter();
  
  const [produk, setProduk] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/produk/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProduk(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal load detail:", err);
        setIsLoading(false);
      });
  }, [params.id]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-[#fef7ff] max-w-md mx-auto">
      <p className="text-violet-600 font-bold animate-pulse">Memuat Detail Produk...</p>
    </div>
  );

  if (!produk || produk.error) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#fef7ff] p-10 text-center max-w-md mx-auto">
      <p className="text-gray-500 font-bold mb-4">Waduh, produk tidak ditemukan di database!</p>
      <button onClick={() => router.back()} className="text-violet-600 font-bold border-b border-violet-600 pb-1">
        Kembali ke Katalog
      </button>
    </div>
  );

  return (
    // Tambahkan max-w-md mx-auto agar background utamanya ikut ke tengah
    <div className="bg-[#fef7ff] text-[#1d1a24] min-h-screen relative z-[60] font-sans max-w-md mx-auto shadow-2xl">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Top App Bar (Dipaku di tengah) */}
      <header className="bg-white/90 backdrop-blur-md fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-4 w-full max-w-md border-b border-rose-100/50 shadow-sm">
        <button onClick={() => router.back()} className="text-violet-600 bg-rose-50 p-2 rounded-full active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Detail Produk</h1>
        <button className="text-violet-600 p-2 rounded-full">
          <span className="material-symbols-outlined">favorite_border</span>
        </button>
      </header>

      <main className="pb-32 pt-16">
        {/* Gambar Produk */}
        <div className="relative w-full h-[380px] bg-white overflow-hidden flex justify-center items-center border-b border-rose-50">
          {produk.gambar_url ? (
            <img alt={produk.nama_produk} className="w-full h-full object-cover" src={produk.gambar_url} />
          ) : (
            <div className="flex flex-col items-center text-rose-200">
              <span className="material-symbols-outlined text-8xl">inventory_2</span>
              <p className="text-xs font-bold mt-2">Belum ada foto</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fef7ff]/60 to-transparent"></div>
        </div>

        {/* Konten Detail */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="bg-white p-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(124,58,237,0.05)] border-x border-t border-rose-100/30">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-[10px] font-black text-white bg-violet-600 px-3 py-1 rounded-full w-max uppercase tracking-widest shadow-sm">
                {produk.kategori || 'Sembako'}
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2 leading-tight">{produk.nama_produk}</h2>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-rose-500">Rp {produk.harga.toLocaleString('id-ID')}</span>
                <span className="text-sm font-bold text-gray-400">/Pcs</span>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-[#f9f1ff] p-5 rounded-2xl border border-violet-100 mb-6">
              <h3 className="text-sm font-black text-violet-900 mb-2">Tentang Produk</h3>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {produk.deskripsi || "Barang berkualitas pilihan Alfashop. Cocok untuk memenuhi kebutuhan harian Anda dengan harga terjangkau."}
              </p>
            </div>

            {/* Info Tambahan */}
            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                  <span className="text-sm font-semibold text-gray-500">Status Stok</span>
                  <span className="text-sm font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">Tersedia</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                  <span className="text-sm font-semibold text-gray-500">Metode Bayar</span>
                  <span className="text-sm font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">Tunai / Kasir</span>
               </div>
            </div>

            {/* Jumlah Beli */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-sm font-bold text-gray-700">Jumlah Pesanan</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-lg active:scale-95 shadow-sm">-</button>
                <span className="text-lg font-black w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg active:scale-95 shadow-md shadow-violet-200">+</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bar Bawah (Dipaku di tengah) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[70] bg-white/90 backdrop-blur-md px-6 pb-6 pt-4 border-t border-gray-100 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <button className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl active:scale-95 transition-transform flex items-center justify-center">
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <button 
            onClick={() => alert(`Sistem mencatat pesanan ${qty}x ${produk.nama_produk}. Silakan bawa barang ke Kasir!`)}
            className="flex-1 bg-violet-600 text-white font-black text-[15px] py-4 rounded-2xl shadow-lg shadow-violet-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">shopping_basket</span>
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}