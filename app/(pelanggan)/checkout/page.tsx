'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, ShoppingBag, Trash2, Receipt, CheckCircle2, Loader2, User, Smartphone, MapPin, Navigation, Plus, Minus, Tag, XCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<'antar' | 'ambil'>('antar');
  const [isMounted, setIsMounted] = useState(false);
  const [ongkirDB, setOngkirDB] = useState(0); // ongkir dari pengaturan toko

  // State voucher
  const [kodeVoucher, setKodeVoucher] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [potonganVoucher, setPotonganVoucher] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherPesan, setVoucherPesan] = useState<{ teks: string; ok: boolean } | null>(null);

  const [formData, setFormData] = useState({ 
    userId: 0,
    fullName: '', 
    whatsapp: '', 
    address: '', 
    mapLink: '', 
    storeLocation: '' 
  });

  useEffect(() => {
    setIsMounted(true);

    // 1. Tarik data keranjang
    const dataKeranjang = JSON.parse(localStorage.getItem('keranjang') || '[]');
    setCartItems(dataKeranjang);

    // 2. Tarik ingatan browser
    const userLoggedIn = localStorage.getItem('user');
    const savedAddress = localStorage.getItem('savedAddress') || ''; 
    const savedWA = localStorage.getItem('savedWA') || ''; 
    const savedName = localStorage.getItem('savedName') || ''; 
    const savedMap = localStorage.getItem('savedMap') || ''; 
    
    let userId = 1;
    let initialName = savedName;
    let initialWA = savedWA;

    if (userLoggedIn) {
      try {
        const user = JSON.parse(userLoggedIn);
        if (user.id) userId = user.id;
        initialName = user.name || savedName;
        initialWA = user.whatsapp || user.no_wa || savedWA;
      } catch (e) {}
    }

    setFormData({
      userId: userId,
      fullName: initialName,
      whatsapp: initialWA,
      address: savedAddress,
      mapLink: savedMap,
      storeLocation: ''
    });

    // Fetch latest profile data
    fetch(`/api/profil?id=${userId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          fullName: data.nama || prev.fullName,
          whatsapp: data.whatsapp || prev.whatsapp,
          address: data.alamat || prev.address,
        }));
      })
      .catch(() => {});


    // 3. Ambil ongkir dari localStorage (disimpan saat homepage load dari /api/pengaturan)
    //    Kalau belum tersimpan, fetch langsung
    const cachedOngkir = localStorage.getItem('ongkir');
    if (cachedOngkir !== null) {
      setOngkirDB(parseInt(cachedOngkir) || 0);
    } else {
      fetch('/api/pengaturan')
        .then(r => r.json())
        .then(d => {
          const nilai = parseInt(d.ongkir) || 0;
          setOngkirDB(nilai);
          localStorage.setItem('ongkir', String(nilai));
        })
        .catch(() => {});
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.harga * (item.qty || 1)), 0);

  useEffect(() => {
    if (isMounted && subtotal < 150000 && deliveryMode === 'antar') {
      setDeliveryMode('ambil');
    }
  }, [subtotal, deliveryMode, isMounted]);

  const ongkir = deliveryMode === 'antar' && cartItems.length > 0 ? ongkirDB : 0;
  const total = subtotal + ongkir - potonganVoucher;

  const hapusItem = (index: number) => {
    const baru = [...cartItems];
    baru.splice(index, 1);
    setCartItems(baru);
    localStorage.setItem('keranjang', JSON.stringify(baru));
    window.dispatchEvent(new Event('storage'));
    // Reset voucher jika keranjang berubah
    setPotonganVoucher(0);
    setKodeVoucher('');
    setVoucherInput('');
    setVoucherPesan(null);
  };

  const updateQty = (index: number, delta: number) => {
    const baru = [...cartItems];
    const currentQty = baru[index].qty || 1;
    const newQty = currentQty + delta;
    
    if (newQty < 1) {
      hapusItem(index);
      return;
    }

    if (baru[index].stok !== undefined && newQty > baru[index].stok) {
      alert(`Maaf bosku, stok cuma sisa ${baru[index].stok} pcs saja!`);
      return;
    }
    
    baru[index].qty = newQty;
    setCartItems(baru);
    localStorage.setItem('keranjang', JSON.stringify(baru));
    window.dispatchEvent(new Event('storage'));
    // Reset voucher jika qty berubah (subtotal berubah)
    setPotonganVoucher(0);
    setKodeVoucher('');
    setVoucherInput('');
    setVoucherPesan(null);
  };

  // AMBIL GPS
  const ambilLokasiGPS = () => {
    if (!navigator.geolocation) return alert("Browser kamu tidak mendukung GPS bosku!");
    
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        setFormData({ ...formData, mapLink: url });
        setLocLoading(false);
        alert("Lokasi GPS berhasil dikunci! 📍");
      },
      () => {
        setLocLoading(false);
        alert("Gagal mengambil lokasi. Pastikan izin lokasi (GPS) sudah aktif di HP/Browser kamu.");
      }
    );
  };

  // TERAPKAN VOUCHER
  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherLoading(true);
    setVoucherPesan(null);
    try {
      const res = await fetch('/api/voucher/cek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode: voucherInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPotonganVoucher(data.potongan);
        setKodeVoucher(data.kode);
        setVoucherPesan({ teks: data.pesan, ok: true });
      } else {
        setPotonganVoucher(0);
        setKodeVoucher('');
        setVoucherPesan({ teks: data.pesan, ok: false });
      }
    } catch {
      setVoucherPesan({ teks: 'Gagal memeriksa voucher.', ok: false });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setPotonganVoucher(0);
    setKodeVoucher('');
    setVoucherInput('');
    setVoucherPesan(null);
  };

  // CHECKOUT
  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert('Keranjang masih kosong bosku!');
    if (!formData.fullName || !formData.whatsapp) return alert('Nama dan WA wajib diisi!');
    if (deliveryMode === 'antar' && !formData.address) return alert('Alamat pengiriman wajib diisi!');

    setLoading(true);
    try {
      const alamatFinal = deliveryMode === 'antar' 
        ? `${formData.address}${formData.mapLink ? ` (GPS: ${formData.mapLink})` : ''}` 
        : `Ambil di Toko Pusat AlfaShop`;
      
      localStorage.setItem('savedName', formData.fullName);
      localStorage.setItem('savedWA', formData.whatsapp);
      if (deliveryMode === 'antar') {
        localStorage.setItem('savedAddress', formData.address);
        localStorage.setItem('savedMap', formData.mapLink);
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: formData.userId,
          fullName: formData.fullName,
          whatsapp: formData.whatsapp,
          address: alamatFinal, 
          ongkir: ongkir,
          items: cartItems,
          kode_voucher: kodeVoucher || null,
          potongan_harga: potonganVoucher,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.removeItem('keranjang'); 
        window.dispatchEvent(new Event('storage'));
        alert("Pesanan Berhasil Dibuat! Notifikasi telah dikirim ke WhatsApp Anda. 🎉");
        router.push('/sukses');
        return;
      } else {
        alert(`Gagal memproses pesanan: ${data.message}`);
      }

    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="p-4 space-y-6 pb-28 bg-[#f8f9fa] dark:bg-[#0f172a] min-h-screen transition-colors duration-300">
      
      {/* FORM PENGIRIMAN */}
      <section className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl shadow-sm border border-[#cfc2d4]/20 dark:border-slate-700/50 transition-colors">
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2 text-[#500088] dark:text-[#c084fc]">
          <Truck size={20} /> Informasi Pengiriman
        </h2>
        <div className="flex bg-[#f3f4f5] dark:bg-slate-800 rounded-xl p-1 mb-5 transition-colors">
          <button 
            onClick={() => {
              if (subtotal >= 150000) setDeliveryMode('antar');
              else alert('Belanja minimal Rp 150.000 untuk menggunakan fitur Antar Kurir.');
            }} 
            className={`flex-1 py-2 text-center flex flex-col items-center justify-center rounded-lg transition-all ${deliveryMode === 'antar' ? 'bg-[#500088] text-white dark:bg-[#c084fc] dark:text-slate-900 shadow-md' : 'bg-transparent text-[#7e7383] dark:text-slate-400'} ${subtotal < 150000 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-[14px] font-bold">Antar Kurir</span>
            {subtotal < 150000 && <span className="text-[10px] font-medium leading-none mt-1">(Min. Rp 150.000)</span>}
          </button>
          <button onClick={() => setDeliveryMode('ambil')} className={`flex-1 py-2.5 flex items-center justify-center rounded-lg text-[14px] font-bold transition-all ${deliveryMode === 'ambil' ? 'bg-[#500088] text-white dark:bg-[#c084fc] dark:text-slate-900 shadow-md' : 'bg-transparent text-[#7e7383] dark:text-slate-400'}`}>Ambil ke Toko</button>
        </div>
        
        <div className="space-y-4">
          <div className="group">
            <label className="text-xs font-black text-[#7e7383] dark:text-slate-400 uppercase flex items-center gap-2 mb-2 ml-1 tracking-wider">
              <User size={14} className="text-[#500088] dark:text-[#c084fc]" /> Nama Lengkap
            </label>
            <input 
              type="text" placeholder="Nama Anda" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/50 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm focus:outline-none focus:border-[#500088] dark:focus:border-[#c084fc] focus:ring-4 focus:ring-[#500088]/10 dark:focus:ring-[#c084fc]/10 transition-all font-bold"
            />
          </div>
          
          <div className="group">
            <label className="text-xs font-black text-[#7e7383] dark:text-slate-400 uppercase flex items-center gap-2 mb-2 ml-1 tracking-wider">
              <Smartphone size={14} className="text-[#500088] dark:text-[#c084fc]" /> Nomor WhatsApp (Terkunci)
            </label>
            <input 
              disabled type="tel" placeholder="08xxxxxxxxxx" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
              className="w-full bg-[#f3f4f5] dark:bg-slate-800 border border-[#cfc2d4]/50 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#7e7383] dark:text-slate-500 text-sm outline-none transition-all font-bold cursor-not-allowed opacity-80"
              title="Nomor WhatsApp tidak bisa diubah karena menyesuaikan dengan profil"
            />
          </div>

          {deliveryMode === 'antar' && (
            <div className="relative animate-in slide-in-from-top-2 flex flex-col gap-3">
              <div className="group">
                <label className="text-xs font-black text-[#7e7383] dark:text-slate-400 uppercase flex items-center gap-2 mb-2 ml-1 tracking-wider">
                  <MapPin size={14} className="text-[#500088] dark:text-[#c084fc]" /> Alamat Pengiriman
                </label>
                <textarea 
                  placeholder="Nama Jalan, RT/RW, Patokan Rumah..." rows={3} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/50 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm focus:outline-none focus:border-[#500088] dark:focus:border-[#c084fc] focus:ring-4 focus:ring-[#500088]/10 dark:focus:ring-[#c084fc]/10 transition-all resize-none font-bold"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1">
                <button 
                  type="button"
                  onClick={ambilLokasiGPS}
                  className={`w-full py-3 rounded-xl border-2 flex items-center justify-center gap-2 text-[13px] font-bold transition-all ${formData.mapLink ? 'border-[#166534] dark:border-emerald-500 text-[#166534] dark:text-emerald-400 bg-[#f0fdf4] dark:bg-emerald-950/30' : 'border-[#500088] dark:border-[#c084fc] text-[#500088] dark:text-[#c084fc] bg-white dark:bg-[#1e293b] hover:bg-[#f1dbff] dark:hover:bg-purple-900/40'}`}
                >
                  {locLoading ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                  {formData.mapLink ? '📍 Lokasi GPS Tersimpan' : 'Gunakan Lokasi GPS Saat Ini'}
                </button>
                {formData.mapLink && <p className="text-[11px] text-[#7e7383] dark:text-slate-500 text-center italic">Link Maps akan dikirim ke WhatsApp Admin</p>}
              </div>
            </div>
          )}

          {deliveryMode === 'ambil' && (
            <div className="relative animate-in slide-in-from-top-2 bg-[#f0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-900/50 rounded-xl p-4 flex items-start gap-3">
              <MapPin className="text-[#16a34a] dark:text-emerald-400 shrink-0" size={20} />
              <div>
                <p className="text-[13px] font-bold text-[#166534] dark:text-emerald-400">Ambil Sendiri di Toko</p>
                <p className="text-[12px] text-[#15803d] dark:text-emerald-500 mt-1">Pesanan Anda akan disiapkan. Silakan ambil langsung di kasir Toko Pusat AlfaShop.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RINGKASAN PESANAN */}
      <section className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl shadow-sm border border-[#cfc2d4]/20 dark:border-slate-700/50 transition-colors">
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2 text-[#500088] dark:text-[#c084fc]">
          <ShoppingBag size={20} /> Ringkasan Pesanan
        </h2>
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto text-[#cfc2d4] dark:text-slate-600 mb-2" size={40} />
            <p className="text-[#7e7383] dark:text-slate-400 text-[14px] font-medium">Keranjang masih kosong...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-center pb-4 border-b border-[#e1e3e4] dark:border-slate-700 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-[#f8f9fa] dark:bg-slate-800 rounded-xl border border-[#cfc2d4]/30 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                  {item.gambar_url ? <img src={item.gambar_url} className="w-full h-full object-cover" /> : <ShoppingBag className="text-[#cfc2d4] dark:text-slate-600" size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-bold text-[#191c1d] dark:text-slate-100 line-clamp-1">{item.nama_produk}</h3>
                  <p className="text-[16px] font-black text-[#b4136d] dark:text-pink-400 mt-0.5">Rp {item.harga.toLocaleString('id-ID')}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2 bg-[#f3f4f5] dark:bg-slate-800 px-1 py-1 rounded-lg border border-[#cfc2d4]/30 dark:border-slate-700">
                      <button onClick={() => updateQty(idx, -1)} className="text-[#500088] dark:text-[#c084fc] p-1 rounded-md hover:bg-[#cfc2d4]/50 dark:hover:bg-slate-700 transition-colors">
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span className="text-[13px] font-bold text-[#4c4452] dark:text-slate-300 w-5 text-center">{item.qty || 1}</span>
                      <button onClick={() => updateQty(idx, 1)} className="text-[#500088] dark:text-[#c084fc] p-1 rounded-md hover:bg-[#cfc2d4]/50 dark:hover:bg-slate-700 transition-colors">
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                    <button onClick={() => hapusItem(idx)} className="text-[#ba1a1a] dark:text-red-400 p-1.5 rounded-full hover:bg-[#ffdad6] dark:hover:bg-red-950/50 transition-colors ml-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INPUT KODE VOUCHER */}
      <section className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl shadow-sm border border-[#cfc2d4]/20 dark:border-slate-700/50 transition-colors">
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2 text-[#500088] dark:text-[#c084fc]">
          <Tag size={20} /> Kode Voucher / Promo
        </h2>

        {kodeVoucher ? (
          // Voucher sudah terapkan — tampilkan ringkasan
          <div className="flex items-center justify-between bg-[#f0fdf4] dark:bg-emerald-950/30 border border-[#a7f3d0] dark:border-emerald-900/50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#059669] dark:text-emerald-400" />
              <div>
                <p className="text-[13px] font-bold text-[#059669] dark:text-emerald-400">Voucher <span className="font-mono tracking-wider">{kodeVoucher}</span> aktif</p>
                <p className="text-[12px] text-[#059669]/80 dark:text-emerald-400/80">Hemat Rp {potonganVoucher.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <button onClick={handleRemoveVoucher} className="text-[#7e7383] dark:text-slate-400 hover:text-[#ba1a1a] dark:hover:text-red-400 transition-colors">
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                placeholder="Masukkan kode voucher..."
                className="flex-1 bg-[#f8f9fa] dark:bg-slate-900 rounded-xl border border-[#cfc2d4]/50 dark:border-slate-700 px-4 py-3 text-[14px] font-mono font-bold uppercase tracking-widest text-[#191c1d] dark:text-slate-100 focus:ring-1 focus:ring-[#500088] dark:focus:ring-[#c084fc] outline-none placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-[#7e7383] dark:placeholder:text-slate-500"
              />
              <button
                onClick={handleApplyVoucher}
                disabled={voucherLoading || !voucherInput.trim()}
                className="px-5 py-3 bg-[#500088] dark:bg-[#c084fc] text-white dark:text-slate-900 rounded-xl text-[13px] font-bold disabled:opacity-50 transition-colors hover:bg-[#3d0068] dark:hover:bg-[#a855f7] flex items-center gap-1.5"
              >
                {voucherLoading ? <Loader2 size={16} className="animate-spin" /> : 'Pakai'}
              </button>
            </div>
            {voucherPesan && (
              <p className={`text-[12px] font-medium px-1 ${voucherPesan.ok ? 'text-[#059669] dark:text-emerald-400' : 'text-[#ba1a1a] dark:text-red-400'}`}>
                {voucherPesan.ok ? '✓ ' : '✗ '}{voucherPesan.teks}
              </p>
            )}
          </div>
        )}
      </section>

      {/* RINCIAN BIAYA */}
      <section className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl shadow-sm border border-[#cfc2d4]/20 dark:border-slate-700/50 transition-colors">
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2 text-[#500088] dark:text-[#c084fc]">
          <Receipt size={20} /> Rincian Biaya
        </h2>
        <div className="space-y-2.5 text-[14px] font-medium">
          <div className="flex justify-between text-[#4c4452] dark:text-slate-300">
            <span>Subtotal Produk</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[#4c4452] dark:text-slate-300">
            <span>Ongkos Kirim</span>
            <span>{ongkir > 0 ? `Rp ${ongkir.toLocaleString('id-ID')}` : <span className="text-[#059669] dark:text-emerald-400 font-bold">Gratis</span>}</span>
          </div>
          {potonganVoucher > 0 && (
            <div className="flex justify-between text-[#059669] dark:text-emerald-400 font-semibold">
              <span>Diskon Voucher ({kodeVoucher})</span>
              <span>- Rp {potonganVoucher.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="border-t border-[#cfc2d4]/30 dark:border-slate-700 pt-3.5 mt-3.5 flex justify-between items-center">
            <span className="text-[16px] font-bold text-[#191c1d] dark:text-slate-100">Total Pembayaran</span>
            <span className="text-[20px] font-black text-[#500088] dark:text-[#c084fc]">Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </section>

      {/* TOMBOL CHECKOUT STICKY */}
      <div className="fixed bottom-[80px] left-0 right-0 z-40 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md p-4 max-w-[428px] mx-auto border-t border-[#cfc2d4]/30 dark:border-slate-700/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.4)] transition-colors duration-300">
        <button 
          onClick={handleCheckout}
          disabled={loading || cartItems.length === 0}
          className="w-full bg-[#500088] dark:bg-[#c084fc] text-white dark:text-slate-900 text-[16px] font-bold py-3.5 rounded-xl shadow-lg shadow-[#500088]/20 dark:shadow-[#c084fc]/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? <Loader2 className="animate-spin" size={22} /> : 'Pesan Sekarang'}
          {!loading && <CheckCircle2 size={22} />}
        </button>
      </div>

    </div>
  );
}