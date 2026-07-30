'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, PackageOpen, X, CheckCircle2, ShoppingCart, Store, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPelanggan() {
  const router = useRouter();
  const [produk, setProduk] = useState<any[]>([]);
  const [produkFilter, setProdukFilter] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTokoBuka, setIsTokoBuka] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);

  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [popupItem, setPopupItem] = useState<any>(null);
  const [selectedVariasi, setSelectedVariasi] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<{teks: string, tipe: 'sukses' | 'error' | ''}>({teks: '', tipe: ''});

  const daftarKategori = ['Semua', 'Beras & Sembako', 'Minuman', 'Makanan Ringan', 'Mie & Instan', 'Sabun & Deterjen', 'Bumbu Dapur', 'Lainnya'];

  useEffect(() => {
    const userLoggedIn = localStorage.getItem('user');
    if (!userLoggedIn) {
      router.replace('/login');
      return; 
    }

    const loadData = async () => {
      try {
        const [resProduk, resPengaturan, resBanner] = await Promise.all([
          fetch('/api/produk'),
          fetch('/api/pengaturan'),
          fetch('/api/banner'),
        ]);

        const dataProduk = await resProduk.json();
        const dataPengaturan = await resPengaturan.json();
        const dataBanner = await resBanner.json();

        const validProduk = Array.isArray(dataProduk) ? dataProduk : [];
        setProduk(validProduk);
        setProdukFilter(validProduk);
        setIsTokoBuka(dataPengaturan?.isOpen ?? true);
        setBanners(Array.isArray(dataBanner) ? dataBanner : []);

        // Simpan ongkir ke localStorage agar bisa dibaca halaman checkout
        if (dataPengaturan.ongkir !== undefined) {
          localStorage.setItem('ongkir', String(dataPengaturan.ongkir || 0));
        }
      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  useEffect(() => {
    let hasil = produk;
    if (kategoriAktif !== 'Semua') {
      hasil = hasil.filter(p => p.kategori?.toLowerCase() === kategoriAktif.toLowerCase());
    }
    if (searchQuery) {
      hasil = hasil.filter(p => p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // Tampilkan produk yang 'tersedia' == true (toggle admin)
    setProdukFilter(hasil.filter(p => p.tersedia !== false && p.tersedia !== 0));
  }, [kategoriAktif, searchQuery, produk]);

  // Auto-rotate banner setiap 4 detik
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // 🔥 UPDATE: Logika Tambah ke Keranjang dengan Validasi Stok & Variasi
  const tambahKeKeranjang = (langsungBeli = false, targetItem: any = null) => {
    const item = targetItem || popupItem;
    if (!item || !isTokoBuka) return; 

    let itemToCart = { ...item };
    
    // Jika lewat modal dan punya variasi
    if (!targetItem && item.variasi && item.variasi.length > 0) {
      if (!selectedVariasi) {
        setToastMessage({ teks: `Silakan pilih variasi terlebih dahulu!`, tipe: 'error' });
        setTimeout(() => setToastMessage({teks: '', tipe: ''}), 3000);
        return;
      }
      if (selectedVariasi.stok <= 0) {
        setToastMessage({ teks: `Maaf, stok variasi ini habis!`, tipe: 'error' });
        setTimeout(() => setToastMessage({teks: '', tipe: ''}), 3000);
        return;
      }
      // Gabungkan data variasi ke item keranjang
      itemToCart = {
        ...item,
        variasi_id: selectedVariasi.id,
        nama_produk: `${item.nama_produk} - ${selectedVariasi.nama_variasi}`,
        harga: selectedVariasi.harga,
        stok: selectedVariasi.stok,
        harga_grosir: selectedVariasi.harga_grosir,
        min_grosir: selectedVariasi.min_grosir
      };
    } else {
       if (item.stok <= 0) return;
    }

    const keranjangLama = JSON.parse(localStorage.getItem('keranjang') || '[]');
    // Cari item berdasarkan id DAN variasi_id jika ada
    const indexBarang = keranjangLama.findIndex((i: any) => 
      i.id === itemToCart.id && i.variasi_id === itemToCart.variasi_id
    );
    
    if (indexBarang !== -1) {
      // Cek apakah jumlah di keranjang sudah melebihi batas stok
      if (keranjangLama[indexBarang].qty >= itemToCart.stok) {
        setToastMessage({ teks: `Maaf, stok ${itemToCart.nama_produk} hanya tersisa ${itemToCart.stok}!`, tipe: 'error' });
        setTimeout(() => setToastMessage({teks: '', tipe: ''}), 3000);
        return;
      }
      keranjangLama[indexBarang].qty += 1;
    } else {
      keranjangLama.push({ ...itemToCart, qty: 1 });
    }
    
    localStorage.setItem('keranjang', JSON.stringify(keranjangLama));
    window.dispatchEvent(new Event('storage'));
    
    if (popupItem) setPopupItem(null); 
    
    if (langsungBeli) {
      router.push('/checkout');
    } else {
      setToastMessage({ teks: `${item.nama_produk} berhasil masuk keranjang!`, tipe: 'sukses' });
      setTimeout(() => setToastMessage({teks: '', tipe: ''}), 3000);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-[#500088] dark:text-[#c084fc] animate-pulse flex flex-col items-center justify-center min-h-screen">Memuat Katalog Alfashop...</div>;

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">

      {/* --- TOAST NOTIFICATION (Bisa Error / Sukses) --- */}
      {toastMessage.teks && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 w-[90%] max-w-[380px] ${toastMessage.tipe === 'sukses' ? 'bg-[#166534] dark:bg-emerald-600' : 'bg-[#ba1a1a] dark:bg-red-600'}`}>
          {toastMessage.tipe === 'sukses' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
          <span className="text-[13px] font-bold line-clamp-2">{toastMessage.teks}</span>
        </div>
      )}

      {/* --- PENGUMUMAN TOKO TUTUP --- */}
      {!isTokoBuka && (
        <div className="bg-[#fff1f2] dark:bg-red-950/50 border border-[#fecaca] dark:border-red-900/50 text-[#ba1a1a] dark:text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
          <Store size={24} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-black">Mohon Maaf, Toko Sedang Tutup 🙏</h3>
            <p className="text-[12px] font-medium mt-1">Anda masih bisa melihat katalog, namun fitur pemesanan sedang dinonaktifkan sementara oleh Admin.</p>
          </div>
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-[#cfc2d4] dark:text-slate-500" size={20} />
        </div>
        <input
          type="text"
          placeholder="Cari produk AlfaShop..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#1e293b] border border-[#cfc2d4] dark:border-slate-700/80 rounded-[16px] pl-10 pr-4 py-3 text-[14px] text-[#191c1d] dark:text-slate-100 placeholder:text-[#7e7383] dark:placeholder:text-slate-400 focus:outline-none focus:border-[#500088] dark:focus:border-[#c084fc] focus:ring-1 focus:ring-[#500088] dark:focus:ring-[#c084fc] shadow-sm transition-all"
        />
      </div>

      {/* --- BANNER PROMO DINAMIS DARI DATABASE --- */}
      {banners.length > 0 ? (
        <div className="w-full h-36 rounded-xl overflow-hidden relative shadow-sm">
          {/* Slides */}
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === bannerIdx ? 1 : 0 }}
            >
              <img
                src={b.gambar_url}
                alt={b.judul || 'Banner Promo'}
                className="w-full h-full object-cover"
              />
              {b.judul && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-5">
                  <h2 className="text-lg font-bold text-white leading-tight">{b.judul}</h2>
                </div>
              )}
            </div>
          ))}
          {/* Dot indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Fallback banner statis jika belum ada banner di database
        <div className="w-full h-36 rounded-xl overflow-hidden relative shadow-sm">
          <img alt="Promo Banner" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#500088]/90 dark:from-slate-900/90 to-transparent flex flex-col justify-center p-5 transition-colors duration-300">
            <span className="text-[10px] font-bold text-white dark:text-slate-900 bg-[#b4136d]/90 dark:bg-[#c084fc]/90 px-2 py-1 rounded-sm w-max mb-1 tracking-wider">PROMO SPESIAL</span>
            <h2 className="text-xl font-bold text-white dark:text-slate-100">Diskon s/d 50%</h2>
            <p className="text-sm text-[#dfb7ff] dark:text-slate-300">Untuk Produk Pilihan</p>
          </div>
        </div>
      )}

      {/* --- CATEGORY CHIPS --- */}
      <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4 py-1">
        <div className="flex gap-2 w-max">
          {daftarKategori.map((kat) => (
            <button
              key={kat}
              onClick={() => setKategoriAktif(kat)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all shadow-sm border ${kategoriAktif === kat
                ? 'bg-[#500088] text-white border-[#500088] dark:bg-[#c084fc] dark:text-slate-900 dark:border-[#c084fc]'
                : 'bg-[#f3f4f5] text-[#4c4452] hover:bg-[#e1e3e4] border-[#cfc2d4] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-slate-700'
                }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[16px] font-bold text-[#191c1d] dark:text-slate-100 transition-colors">Katalog Tersedia</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {produkFilter.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 dark:text-slate-500 py-10 flex flex-col items-center">
              <PackageOpen size={48} className="mb-2 opacity-20 text-[#500088] dark:text-[#c084fc]" />
              <p className="text-sm font-bold">Produk tidak ditemukan</p>
            </div>
          ) : (
            produkFilter.map((item) => {
              const hasVariasi = item.variasi && item.variasi.length > 0;
              const displayStok = hasVariasi ? Math.max(...item.variasi.map((v: any) => v.stok)) : item.stok;
              return (
              <div key={item.id} onClick={() => { setPopupItem(item); if (hasVariasi) setSelectedVariasi(item.variasi[0]); }} className="bg-white dark:bg-[#1e293b] rounded-xl overflow-hidden shadow-sm flex flex-col border border-[#e1e3e4] dark:border-slate-700/80 active:scale-[0.98] transition-transform cursor-pointer group">
                <div className="w-full aspect-square relative bg-[#f3f4f5] dark:bg-slate-800 flex items-center justify-center p-2 overflow-hidden transition-colors">
                  {item.gambar_url ? (
                    <img alt={item.nama_produk} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" src={item.gambar_url} />
                  ) : (
                    <ShoppingBag size={40} className="text-[#cfc2d4] dark:text-slate-600" />
                  )}
                  {/* Overlay jika toko tutup atau stok 0 */}
                  {(!isTokoBuka || item.stok <= 0) && <div className="absolute inset-0 bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-[1px]"></div>}
                </div>
                <div className="p-3 flex flex-col flex-grow justify-between gap-3">
                  <div>
                    <h4 className={`text-[13px] font-semibold line-clamp-2 leading-tight ${isTokoBuka && item.stok > 0 ? 'text-[#191c1d] dark:text-slate-100' : 'text-[#7e7383] dark:text-slate-500'}`}>{item.nama_produk}</h4>
                    
                    {/* 🔥 UPDATE: LABEL STOK DI GRID */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {item.is_bundle && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">PAKET HEMAT</span>
                      )}
                      {item.is_promo && (
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">PROMO</span>
                      )}
                      {item.stok > 0 || displayStok > 0 ? (
                        <span className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 bg-[#ecfdf5] dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-[#a7f3d0] dark:border-emerald-800/50">Tersedia</span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#ba1a1a] dark:text-red-400 bg-[#fff1f2] dark:bg-red-950/50 px-2 py-0.5 rounded border border-[#fecaca] dark:border-red-800/50">Stok Habis</span>
                      )}
                    </div>
                  </div>

                    <div>
                      {item.is_promo && !hasVariasi && (
                        <div className="text-[11px] text-gray-400 dark:text-slate-500 line-through mb-0.5 leading-none">Rp {item.harga_asli?.toLocaleString('id-ID')}</div>
                      )}
                      
                      {hasVariasi ? (
                         <div className={`text-[13px] font-black mb-2 ${isTokoBuka && displayStok > 0 ? 'text-[#b4136d] dark:text-pink-400' : 'text-[#7e7383] dark:text-slate-500'}`}>Mulai Rp {Math.min(...item.variasi.map((v:any) => v.harga)).toLocaleString('id-ID')}</div>
                      ) : (
                         <div className={`text-[15px] font-black mb-2 ${isTokoBuka && item.stok > 0 ? 'text-[#b4136d] dark:text-pink-400' : 'text-[#7e7383] dark:text-slate-500'}`}>Rp {item.harga.toLocaleString('id-ID')}</div>
                      )}
                      
                      <div className="flex gap-2">
                        {hasVariasi ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPopupItem(item); setSelectedVariasi(item.variasi[0]); }}
                            disabled={!isTokoBuka || displayStok <= 0}
                            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center transition-colors active:scale-95 ${isTokoBuka && displayStok > 0 ? 'bg-[#500088] text-white dark:bg-[#c084fc] dark:text-slate-900 hover:bg-[#7a00cc] dark:hover:bg-[#a855f7]' : 'bg-[#cfc2d4] text-white dark:bg-slate-700 dark:text-slate-400'}`}
                          >
                            Pilih Variasi
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); tambahKeKeranjang(false, item); }}
                              disabled={!isTokoBuka || item.stok <= 0}
                              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center transition-colors active:scale-95 ${isTokoBuka && item.stok > 0 ? 'bg-[#f1dbff] text-[#500088] dark:bg-purple-900/40 dark:text-[#c084fc] hover:bg-[#e4c2f7] dark:hover:bg-purple-900/60' : 'bg-[#f3f4f5] text-[#cfc2d4] dark:bg-slate-800 dark:text-slate-600'}`}
                              title="Tambah ke Keranjang"
                            >
                              <ShoppingCart size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); tambahKeKeranjang(true, item); }}
                              disabled={!isTokoBuka || item.stok <= 0}
                              className={`flex-[2] py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center transition-colors active:scale-95 ${isTokoBuka && item.stok > 0 ? 'bg-[#500088] text-white dark:bg-[#c084fc] dark:text-slate-900 hover:bg-[#7a00cc] dark:hover:bg-[#a855f7]' : 'bg-[#cfc2d4] text-white dark:bg-slate-700 dark:text-slate-400'}`}
                            >
                              Beli
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* --- MODAL POPUP (CENTERED) --- */}
      {popupItem && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/40 backdrop-blur-[1px] transition-colors" onClick={() => setPopupItem(null)}></div>
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-[#1e293b] rounded-[24px] shadow-2xl w-full max-w-[400px] flex flex-col max-h-[85vh] animate-in zoom-in-95 fade-in duration-200 border border-slate-200 dark:border-slate-700 pointer-events-auto overflow-hidden">
              
              {/* Header with Close Button on Left */}
              <div className="px-4 py-3 flex items-center gap-3 shrink-0 border-b border-[#cfc2d4]/30 dark:border-slate-700/80 bg-white dark:bg-[#1e293b] transition-colors">
                <button onClick={() => setPopupItem(null)} className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full bg-[#e7e8e9] text-[#191c1d] dark:bg-slate-700 dark:text-slate-200 hover:bg-[#cfc2d4] dark:hover:bg-slate-600 transition-colors"><X size={20} /></button>
                <h2 className="text-[18px] font-bold text-[#191c1d] dark:text-slate-100">Detail Produk</h2>
              </div>
              
              {/* Scrollable Content */}
              <div className="px-4 py-4 flex flex-col gap-4 overflow-y-auto flex-1">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-[#f8f9fa] dark:bg-slate-800 border border-[#cfc2d4]/30 dark:border-slate-700/80 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {popupItem.gambar_url ? <img src={popupItem.gambar_url} className="w-full h-full object-cover" /> : <PackageOpen className="text-[#cfc2d4] dark:text-slate-600" size={32} />}
                    {popupItem.stok <= 0 && <div className="absolute inset-0 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-[1px]"></div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-[#191c1d] dark:text-slate-100 leading-tight">{popupItem.nama_produk}</h3>
                    {popupItem.is_promo && (!popupItem.variasi || popupItem.variasi.length === 0) && (
                      <p className="text-[13px] text-gray-400 dark:text-slate-500 line-through mt-1">Rp {popupItem.harga_asli?.toLocaleString('id-ID')}</p>
                    )}
                    {popupItem.variasi && popupItem.variasi.length > 0 ? (
                       <p className="text-[20px] font-black text-[#b4136d] dark:text-pink-400 mt-0.5">Rp {selectedVariasi ? selectedVariasi.harga.toLocaleString('id-ID') : Math.min(...popupItem.variasi.map((v:any) => v.harga)).toLocaleString('id-ID')}</p>
                    ) : (
                       <p className="text-[20px] font-black text-[#b4136d] dark:text-pink-400 mt-0.5">Rp {popupItem.harga.toLocaleString('id-ID')}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {popupItem.is_bundle && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">PAKET HEMAT</span>
                      )}
                      {popupItem.is_promo && (
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">PROMO</span>
                      )}
                      <span className="px-2 py-0.5 bg-[#f1dbff] text-[#500088] dark:bg-purple-900/40 dark:text-[#c084fc] text-[10px] font-bold rounded uppercase">
                        {popupItem.kategori || 'Umum'}
                      </span>
                      {/* 🔥 UPDATE: LABEL STOK DI POPUP */}
                      {popupItem.variasi && popupItem.variasi.length > 0 && selectedVariasi ? (
                         selectedVariasi.stok > 0 ? (
                           <span className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 bg-[#ecfdf5] dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-[#a7f3d0] dark:border-emerald-800/50">Sisa {selectedVariasi.stok}</span>
                         ) : (
                           <span className="text-[10px] font-bold text-[#ba1a1a] dark:text-red-400 bg-[#fff1f2] dark:bg-red-950/50 px-2 py-0.5 rounded border border-[#fecaca] dark:border-red-800/50">Habis</span>
                         )
                      ) : popupItem.stok > 0 ? (
                        <span className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 bg-[#ecfdf5] dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-[#a7f3d0] dark:border-emerald-800/50">Sisa {popupItem.stok}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#ba1a1a] dark:text-red-400 bg-[#fff1f2] dark:bg-red-950/50 px-2 py-0.5 rounded border border-[#fecaca] dark:border-red-800/50">Stok Habis</span>
                      )}
                    </div>
                  </div>
                </div>

                {popupItem.variasi && popupItem.variasi.length > 0 && (
                  <div className="flex flex-col gap-2 bg-white dark:bg-slate-700 p-3 rounded-xl border border-[#cfc2d4]/30 dark:border-slate-600">
                    <h4 className="text-[13px] font-bold text-[#191c1d] dark:text-slate-100">Pilih Variasi:</h4>
                    <div className="flex flex-wrap gap-2">
                      {popupItem.variasi.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariasi(v)}
                          disabled={v.stok <= 0}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors border ${
                            selectedVariasi?.id === v.id
                              ? 'bg-[#500088] text-white border-[#500088] dark:bg-[#c084fc] dark:text-slate-900 dark:border-[#c084fc]'
                              : v.stok <= 0 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700 cursor-not-allowed opacity-60'
                                : 'bg-[#f3f4f5] text-[#4c4452] border-[#cfc2d4] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:bg-[#e1e3e4] dark:hover:bg-slate-700'
                          }`}
                        >
                          {v.nama_variasi}
                        </button>
                      ))}
                    </div>
                    {selectedVariasi && selectedVariasi.harga_grosir > 0 && selectedVariasi.min_grosir > 0 && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mt-1">
                        * Beli min {selectedVariasi.min_grosir} otomatis dapat harga grosir (Rp {selectedVariasi.harga_grosir.toLocaleString('id-ID')})
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-[#f3f4f5] dark:bg-slate-800/50 p-3 rounded-xl border border-[#cfc2d4]/20 dark:border-slate-700/80 min-h-[120px] flex flex-col">
                  {popupItem.is_bundle && popupItem.bundle_items?.length > 0 && (
                    <div className="mb-4 bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                      <h5 className="text-[12px] font-bold text-[#500088] dark:text-[#c084fc] mb-1">Isi Paket Ini:</h5>
                      <ul className="text-[12px] text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {popupItem.bundle_items.map((b: any, idx: number) => (
                          <li key={idx}><strong>{b.jumlah}x</strong> {b.nama_produk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <h4 className="text-[13px] font-bold text-[#191c1d] dark:text-slate-200 mb-2">Deskripsi :</h4>
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-[13px] text-[#4c4452] dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words text-justify">
                      {popupItem.deskripsi || "Tidak ada deskripsi untuk produk ini."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sticky Buttons */}
              <div className="px-4 py-3 shrink-0 bg-white dark:bg-[#1e293b] border-t border-[#cfc2d4]/30 dark:border-slate-700/80 transition-colors">
                <div className="flex gap-2">
                  <button 
                    onClick={() => tambahKeKeranjang(false)}
                    disabled={!isTokoBuka || popupItem.stok <= 0}
                    className={`flex-1 py-3.5 transition-all rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] border-2 ${
                      isTokoBuka && popupItem.stok > 0
                      ? 'border-[#500088] text-[#500088] dark:border-[#c084fc] dark:text-[#c084fc] hover:bg-[#f1dbff] dark:hover:bg-purple-900/40 active:scale-[0.98]' 
                      : 'border-[#cfc2d4] text-[#cfc2d4] dark:border-slate-600 dark:text-slate-600 cursor-not-allowed opacity-80'
                    }`}
                    title="Tambah ke Keranjang"
                  >
                    <ShoppingCart size={20} />
                  </button>
                  <button 
                    onClick={() => tambahKeKeranjang(true)}
                    disabled={!isTokoBuka || popupItem.stok <= 0}
                    className={`flex-[3] py-3.5 transition-all rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] ${
                      isTokoBuka && popupItem.stok > 0
                      ? 'bg-[#500088] text-white dark:bg-[#c084fc] dark:text-slate-900 active:scale-[0.98] shadow-sm' 
                      : 'bg-[#cfc2d4] text-white dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed opacity-80'
                    }`}
                  >
                    {!isTokoBuka 
                      ? 'Toko Sedang Tutup' 
                      : popupItem.stok <= 0 
                        ? 'Barang Habis' 
                        : 'Beli Sekarang'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}