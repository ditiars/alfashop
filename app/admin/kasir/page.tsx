'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, QrCode, Plus, Minus, Trash2, PackageOpen, Banknote, CheckCircle2, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Daftar Kategori
const DAFTAR_KATEGORI = ['Semua', 'Beras & Sembako', 'Minuman', 'Makanan Ringan', 'Mie & Instan', 'Sabun & Deterjen', 'Bumbu Dapur', 'Lainnya'];

interface CartItem {
  id: number;
  nama_produk: string;
  harga: number;
  gambar_url: string;
  quantity: number;
  stok: number; 
}

export default function KasirPOSPage() {
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Kasir
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [uangDibayar, setUangDibayar] = useState<number | ''>('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [pesanSukses, setPesanSukses] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/produk?t=${new Date().getTime()}`);
      if (!res.ok) throw new Error('Gagal mengambil data produk');
      const data = await res.json();
      setProdukList(data || []);
    } catch (error) {
      console.error("Error load produk:", error);
      showToast("Gagal memuat katalog produk");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = (produk: any) => {
    if (produk.stok <= 0) {
      showToast(`❌ Stok ${produk.nama_produk} habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find(item => item.id === produk.id);
      if (existing) {
        if (existing.quantity >= produk.stok) {
          showToast(`⚠️ Maksimal stok tercapai (${produk.stok} pcs)!`);
          return prev;
        }
        return prev.map(item => item.id === produk.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        id: produk.id, 
        nama_produk: produk.nama_produk, 
        harga: produk.harga, 
        gambar_url: produk.gambar_url, 
        quantity: 1,
        stok: produk.stok 
      }];
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (delta > 0 && newQty > item.stok) {
          showToast(`⚠️ Stok hanya tersisa ${item.stok} pcs!`);
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter(item => item.id !== id));
    showToast("Barang dihapus dari pesanan");
  };

  const totalBelanja = cart.reduce((total, item) => total + (item.harga * item.quantity), 0);
  const kembalian = typeof uangDibayar === 'number' ? uangDibayar - totalBelanja : 0;

  const handleScanClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      showToast("Siap memindai! Arahkan scanner ke barcode...");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const matchedProduct = produkList.find(p => p.nama_produk.toLowerCase() === searchQuery.toLowerCase().trim());
      
      if (matchedProduct) {
        handleAddToCart(matchedProduct);
        setSearchQuery(''); 
      } else {
        showToast(`❌ Produk tidak ditemukan!`);
      }
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong!');
    if (typeof uangDibayar !== 'number' || uangDibayar < totalBelanja) {
      showToast('⚠️ Uang pembayaran kurang!');
      return;
    }
    setIsCheckout(true);

    try {
      const payload = {
        nama_pelanggan: 'Pelanggan Kasir (Offline)',
        total_harga: totalBelanja,
        uang_dibayar: uangDibayar,
        kembalian: kembalian,
        items: cart.map(item => ({
          id: item.id,
          qty: item.quantity,
          harga: item.harga
        }))
      };

      const res = await fetch('/api/admin/kasir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memproses transaksi ke database');

      setPesanSukses(true);
      setCart([]);
      setUangDibayar('');
      
      fetchProduk();

      const orderId = data.pesanan_id || data.id; 
      if (orderId) {
        window.open(`/nota?id=${orderId}`, '_blank');
      } else {
        showToast("Transaksi sukses, tapi ID Nota gagal ditarik.");
      }

      setTimeout(() => setPesanSukses(false), 3000);
    } catch (err: any) {
      alert(`Gagal memproses pembayaran: ${err.message}`);
    } finally {
      setIsCheckout(false);
    }
  };

  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'Semua' ? true : p.kategori === filterKategori;
    const matchTersedia = p.tersedia !== false && p.tersedia !== 0; 
    return matchSearch && matchKategori && matchTersedia;
  });

  return (
    <div className="flex h-screen bg-admin-background font-body-md text-admin-on-surface overflow-hidden relative">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 16, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[999999] bg-admin-inverse-surface text-admin-on-primary px-5 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl shadow-black/10 whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex overflow-hidden bg-admin-background w-full">
        {/* Left Column: Product Browsing */}
        <section className="flex-1 flex flex-col min-w-0 pr-6 pl-12 py-6">
          
          {/* Action Bar & Filters */}
          <div className="mb-6 flex flex-col gap-3">
            {/* Scan Input */}
            <div className="relative w-full max-w-[800px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[22px]">barcode_scanner</span>
              <input 
                ref={searchInputRef}
                autoFocus
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-admin-surface-container-high/60 backdrop-blur-sm pl-12 pr-20 py-3 rounded-xl border border-admin-outline-variant/30 focus:bg-admin-surface-container-high focus:border-admin-primary/50 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 text-admin-on-surface placeholder-admin-on-surface-variant/70 transition-all font-medium text-[15px] shadow-sm hover:border-admin-outline-variant/60"
                placeholder="Scan barcode or enter SKU..." 
              />
              <button 
                onClick={handleScanClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-admin-secondary-container text-admin-on-secondary-container rounded font-label-sm text-label-sm hover:bg-admin-secondary-fixed transition-colors"
              >
                Find
              </button>
            </div>
            
            {/* Category Pills */}
            <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar-mini mt-3">
              {DAFTAR_KATEGORI.map((kat) => (
                <button 
                  key={kat} 
                  onClick={() => setFilterKategori(kat)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors shadow-sm ${
                    filterKategori === kat 
                      ? 'bg-admin-primary-container text-admin-on-primary-container border border-transparent shadow-[0_0_15px_rgba(167,221,199,0.1)]' 
                      : 'bg-admin-surface-container border border-admin-outline-variant/50 text-admin-on-surface-variant hover:bg-admin-surface-container-high'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Container */}
          <div className="flex-1 overflow-y-auto pr-3 pb-16 custom-scrollbar-mini">
            {isLoading ? (
               <div className="flex justify-center items-center h-48 text-admin-on-surface-variant font-bold animate-pulse">Memuat Produk...</div>
            ) : filteredProduk.length === 0 ? (
               <div className="flex justify-center items-center h-48 text-admin-on-surface-variant font-semibold">Produk tidak ditemukan.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProduk.map((produk) => (
                  <div 
                    key={produk.id} 
                    onClick={() => handleAddToCart(produk)}
                    className={`bg-admin-surface-container rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all group ${
                      produk.stok <= 0 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'hover:ring-1 hover:ring-admin-primary'
                    }`}
                  >
                    <div className="w-full aspect-square bg-admin-surface-container-high rounded-lg mb-1 overflow-hidden relative">
                      {produk.gambar_url ? (
                        <img 
                          src={produk.gambar_url} 
                          className={`w-full h-full object-cover transition-all duration-300 ${produk.stok > 0 ? 'group-hover:scale-105' : ''}`} 
                          alt={produk.nama_produk} 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-admin-outline-variant">
                          <PackageOpen size={40} className={`transition-all duration-300 ${produk.stok > 0 ? 'group-hover:scale-110 group-hover:text-admin-secondary' : ''}`} />
                        </div>
                      )}
                      
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded font-bold text-[10px] shadow-sm ${
                        produk.stok > 0 ? 'bg-admin-secondary-container text-admin-on-secondary-container' : 'bg-admin-error-container text-admin-on-error-container'
                      }`}>
                        Stok: {produk.stok}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-sm text-admin-on-surface line-clamp-1">{produk.nama_produk}</h3>
                    <div className="text-admin-on-surface-variant font-semibold text-[10px] uppercase">{produk.kategori || 'Lainnya'}</div>
                    <div className="text-lg text-admin-primary font-bold mt-auto pt-1 tracking-tight">Rp {produk.harga.toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Current Order (Cart) */}
        <aside className="w-[380px] bg-admin-surface-container-low border-l border-admin-outline-variant/30 flex flex-col flex-shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.1)]">
          
          {/* Order Header */}
          <div className="p-6 border-b border-admin-outline-variant/30 flex justify-between items-center bg-admin-surface-container">
            <div>
              <h2 className="text-xl font-bold text-admin-on-surface">Pesanan Saat Ini</h2>
              <p className="text-xs font-semibold text-admin-on-surface-variant mt-1">Kasir Aktif</p>
            </div>
            <button 
              onClick={() => {
                if (window.confirm('Kosongkan semua pesanan?')) setCart([]);
              }}
              disabled={cart.length === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center text-admin-on-surface-variant hover:bg-admin-error-container hover:text-admin-error transition-colors disabled:opacity-30 disabled:hover:bg-transparent" 
              title="Kosongkan Pesanan"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Order Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar-mini">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-admin-outline-variant">
                 <PackageOpen size={48} className="mb-2 opacity-50"/>
                 <span className="text-sm font-semibold">Keranjang kosong</span>
               </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-admin-surface-container-high rounded-lg p-3 flex flex-col gap-3 border border-transparent hover:border-admin-outline-variant/30 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm text-admin-on-surface font-semibold leading-tight line-clamp-2">{item.nama_produk}</h4>
                      <div className="text-[11px] font-semibold text-admin-on-surface-variant mt-1">Rp {item.harga.toLocaleString('id-ID')} / unit</div>
                    </div>
                    <div className="text-sm text-admin-primary font-bold">Rp {(item.harga * item.quantity).toLocaleString('id-ID')}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-admin-surface-container rounded-md p-0.5 border border-admin-outline-variant/30">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded text-admin-on-surface-variant hover:bg-admin-surface-container-highest hover:text-admin-on-surface transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-admin-on-surface">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        disabled={item.quantity >= item.stok}
                        className={`w-7 h-7 flex items-center justify-center rounded text-admin-on-surface-variant transition-colors ${item.quantity >= item.stok ? 'opacity-30 cursor-not-allowed' : 'hover:bg-admin-surface-container-highest hover:text-admin-on-surface'}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-admin-error opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-2 hover:bg-admin-error-container rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Summary Block */}
          <div className="p-6 bg-admin-surface-container border-t border-admin-outline-variant/30 flex flex-col gap-4">
            
            <div className="space-y-2">
              <div className="flex justify-between text-admin-on-surface-variant text-sm font-semibold">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
                <span>Rp {totalBelanja.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="h-px w-full bg-admin-outline-variant/30 my-1"></div>
            
            <div className="flex justify-between items-end mb-1">
              <span className="text-xl text-admin-on-surface font-bold">Total</span>
              <span className="text-3xl text-admin-primary font-black leading-none tracking-tight">Rp {totalBelanja.toLocaleString('id-ID')}</span>
            </div>

            {/* Input Pembayaran Custom */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-bold text-admin-on-surface-variant">Nominal Uang Diterima</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-admin-outline">Rp</span>
                <input 
                  type="number" 
                  value={uangDibayar} 
                  onChange={(e) => setUangDibayar(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full bg-admin-background border-2 border-admin-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-right text-base font-black text-admin-on-surface focus:outline-none focus:border-admin-secondary-container transition-colors"
                />
              </div>
            </div>

            {typeof uangDibayar === 'number' && uangDibayar >= totalBelanja && (
              <div className="flex justify-between items-center bg-admin-primary-container/20 border border-admin-primary-container/30 px-4 py-3 rounded-lg mb-2">
                <span className="text-sm font-bold text-admin-on-surface-variant">Kembalian</span>
                <span className="text-lg font-black text-admin-primary">Rp {kembalian.toLocaleString('id-ID')}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <button onClick={() => setUangDibayar(totalBelanja)} className="w-1/3 bg-admin-surface-container-high hover:bg-admin-surface-container-highest border border-admin-outline-variant/30 text-admin-on-surface font-bold text-sm py-4 rounded-xl transition-all">
                Uang Pas
              </button>
              
              {pesanSukses ? (
                <div className="w-2/3 bg-admin-primary text-admin-on-primary font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-admin-primary/20 animate-pulse">
                  <Printer size={20} /> Mencetak...
                </div>
              ) : (
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isCheckout || (typeof uangDibayar === 'number' && uangDibayar < totalBelanja) || uangDibayar === ''}
                  className="w-2/3 bg-admin-primary-container hover:bg-admin-primary-fixed text-admin-on-primary-container font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-admin-primary-container"
                >
                  <Banknote size={24} /> Bayar
                </button>
              )}
            </div>
            
          </div>
        </aside>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar-mini::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: var(--color-admin-outline-variant, #374151); border-radius: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: var(--color-admin-outline, #4b5563); }
      `}} />
    </div>
  );
}