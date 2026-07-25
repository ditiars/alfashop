'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function ManajemenBundlingPage() {
  const [bundleList, setBundleList] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pesanNotif, setPesanNotif] = useState<{jenis: 'sukses' | 'error', teks: string} | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBundles, setSelectedBundles] = useState<number[]>([]);

  const initialFormData = {
    nama_produk: '',
    harga: '',
    gambar_url: '', 
    deskripsi: '',
    bundle_items: [] as { produk_id: number, nama_produk: string, jumlah: number, harga_satuan: number, stok_satuan: number }[]
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produk?all=true');
      if (!res.ok) throw new Error('Gagal mengambil data produk');
      const data = await res.json();
      setAllProducts(data.filter((p: any) => !p.is_bundle));
      setBundleList(data.filter((p: any) => p.is_bundle));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (bundle: any) => {
    setEditingId(bundle.id);
    setFormData({
      nama_produk: bundle.nama_produk,
      harga: bundle.harga.toString(),
      gambar_url: bundle.gambar_url || '',
      deskripsi: bundle.deskripsi || '',
      bundle_items: bundle.bundle_items || []
    });
    setIsModalOpen(true);
  };

  const handleAddBundleItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = parseInt(e.target.value);
    if (!pid) return;
    
    // Cek apakah sudah ada
    if (formData.bundle_items.find(i => i.produk_id === pid)) return;

    const prod = allProducts.find(p => p.id === pid);
    if (prod) {
      setFormData({
        ...formData,
        bundle_items: [...formData.bundle_items, {
          produk_id: prod.id,
          nama_produk: prod.nama_produk,
          jumlah: 1,
          harga_satuan: prod.harga,
          stok_satuan: prod.stok
        }]
      });
    }
    e.target.value = '';
  };

  const handleRemoveBundleItem = (pid: number) => {
    setFormData({
      ...formData,
      bundle_items: formData.bundle_items.filter(i => i.produk_id !== pid)
    });
  };

  const handleUpdateItemQty = (pid: number, qty: number) => {
    if (qty < 1) qty = 1;
    setFormData({
      ...formData,
      bundle_items: formData.bundle_items.map(i => i.produk_id === pid ? { ...i, jumlah: qty } : i)
    });
  };

  const handleSubmitBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanNotif(null);

    if (!formData.nama_produk || !formData.harga) {
      setPesanNotif({ jenis: 'error', teks: 'Nama dan Harga Paket wajib diisi!' });
      return;
    }
    if (formData.bundle_items.length === 0) {
      setPesanNotif({ jenis: 'error', teks: 'Paket harus memiliki minimal 1 produk!' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        nama_produk: formData.nama_produk,
        kategori: 'Paket Bundling',
        harga: parseInt(formData.harga),
        satuan: 'Paket',
        stok: 0, // Stok dihitung dinamis dari sub-item saat checkout
        gambar_url: formData.gambar_url || null,
        deskripsi: formData.deskripsi || null,
        is_bundle: true,
        bundle_items: formData.bundle_items
      };

      if (editingId) {
        payload.id = editingId;
        const res = await fetch('/api/produk', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Gagal update paket');
        const data = await res.json();
        
        setBundleList(bundleList.map(b => b.id === editingId ? data : b));
        setPesanNotif({ jenis: 'sukses', teks: 'Perubahan paket berhasil disimpan!' });
      } else {
        payload.tersedia = true;
        const res = await fetch('/api/produk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Gagal simpan paket baru');
        const data = await res.json();
        
        setBundleList([data, ...bundleList]); 
        setPesanNotif({ jenis: 'sukses', teks: 'Paket baru berhasil ditambahkan.' });
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormData(initialFormData);
        setEditingId(null);
        setPesanNotif(null);
      }, 1500);

    } catch (err: any) {
      setPesanNotif({ jenis: 'error', teks: `Error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus paket ini?')) return;
    
    try {
      const res = await fetch(`/api/produk?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBundleList(bundleList.filter(p => p.id !== id));
      } else {
        alert("Gagal menghapus paket");
      }
    } catch (error) {
      alert("Gagal menghapus paket");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean, produkUtuh: any) => {
    try {
      const res = await fetch('/api/produk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...produkUtuh, id, tersedia: !currentStatus })
      });
      if (res.ok) {
        setBundleList(bundleList.map(p => p.id === id ? { ...p, tersedia: !currentStatus } : p));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setPesanNotif(null);
    setIsModalOpen(false);
  };

  const filteredBundles = bundleList.filter(p => {
    const namaProduk = p?.nama_produk || '';
    return namaProduk.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-auto relative w-full h-full text-admin-on-surface font-body-md">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
              <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Paket Bundling</h2>
              <p className="text-admin-on-surface-variant mt-1 text-sm">Buat paket beli hemat untuk meningkatkan nilai transaksi</p>
          </div>
          <button 
              onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData(initialFormData); setPesanNotif(null); }}
              className="bg-admin-primary-container text-admin-on-primary-container hover:bg-admin-primary transition-colors font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(167,221,199,0.1)] hover:shadow-[0_0_20px_rgba(167,221,199,0.2)] text-sm"
          >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Buat Paket Baru
          </button>
      </div>

      {/* Filters & Actions */}
      <div className="bg-admin-surface-container/60 backdrop-blur-xl border border-admin-outline-variant/30 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64 group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[20px] group-focus-within:text-admin-primary transition-colors">search</span>
                  <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari paket..." 
                      className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 text-admin-on-surface rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-admin-primary-container focus:ring-1 focus:ring-admin-primary-container focus:outline-none transition-all placeholder:text-admin-on-surface-variant/50"
                  />
              </div>
          </div>
      </div>

      {/* Data Table */}
      <div className="bg-admin-surface-container-low/30 rounded-2xl border border-admin-surface-container-high overflow-hidden shadow-lg mb-20">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                      <tr className="bg-admin-surface-container-high/50 text-admin-on-surface-variant text-xs uppercase tracking-wider font-semibold border-b border-admin-surface-container-high">
                          <th className="p-4">Nama Paket</th>
                          <th className="p-4">Isi Paket</th>
                          <th className="p-4 text-right">Harga Paket</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Aksi</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {isLoading ? (
                          <tr><td colSpan={5} className="p-8 text-center text-admin-on-surface-variant animate-pulse">Memuat data paket...</td></tr>
                      ) : filteredBundles.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-admin-on-surface-variant flex-col items-center flex justify-center"><span className="material-symbols-outlined text-4xl mb-2 text-admin-outline-variant">card_giftcard</span><p>Tidak ada paket ditemukan.</p></td></tr>
                      ) : (
                          filteredBundles.map(bundle => {
                              // Kalkulasi stok maksimal paket berdasarkan komponen
                              let maxBundleStock = -1;
                              bundle.bundle_items?.forEach((i: any) => {
                                  const possibleStock = Math.floor(i.stok_satuan / i.jumlah);
                                  if (maxBundleStock === -1 || possibleStock < maxBundleStock) {
                                      maxBundleStock = possibleStock;
                                  }
                              });
                              if (maxBundleStock === -1) maxBundleStock = 0;

                              const totalHargaSatuan = bundle.bundle_items?.reduce((sum: number, i: any) => sum + (i.harga_satuan * i.jumlah), 0) || 0;
                              const hemat = totalHargaSatuan - bundle.harga;

                              return (
                              <tr key={bundle.id} className="border-b border-admin-surface-container-high hover:bg-admin-surface-container transition-colors group">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-lg bg-admin-surface-container flex items-center justify-center overflow-hidden border border-admin-outline-variant/30 flex-shrink-0">
                                              {bundle.gambar_url ? (
                                                  <img src={bundle.gambar_url} alt={bundle.nama_produk} className="w-full h-full object-cover" />
                                              ) : (
                                                  <span className="material-symbols-outlined text-admin-on-surface-variant">image</span>
                                              )}
                                          </div>
                                          <div>
                                              <p className={`font-semibold text-admin-on-surface ${!bundle.tersedia && 'line-through text-admin-on-surface-variant'}`}>{bundle.nama_produk}</p>
                                              <p className="text-xs text-admin-on-surface-variant mt-1">Stok estimasi: {maxBundleStock} paket</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <div className="flex flex-col gap-1 text-xs">
                                          {bundle.bundle_items?.map((i: any, idx: number) => (
                                              <div key={idx} className="flex items-center gap-2">
                                                  <span className="bg-admin-surface-container-high px-1.5 py-0.5 rounded font-medium">{i.jumlah}x</span>
                                                  <span className="text-admin-on-surface-variant truncate max-w-[200px]" title={i.nama_produk}>{i.nama_produk}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex flex-col items-end">
                                        <p className="font-bold text-admin-primary">Rp {bundle.harga.toLocaleString('id-ID')}</p>
                                        {hemat > 0 && (
                                            <p className="text-[10px] text-admin-error line-through mt-0.5">Rp {totalHargaSatuan.toLocaleString('id-ID')}</p>
                                        )}
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" className="sr-only peer" checked={bundle.tersedia} onChange={() => handleToggleStatus(bundle.id, bundle.tersedia, bundle)} />
                                          <div className="w-9 h-5 bg-admin-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-on-surface-variant after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-admin-surface-container-lowest peer-checked:bg-admin-primary-container"></div>
                                      </label>
                                  </td>
                                  <td className="p-4">
                                      <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleEditClick(bundle)} className="text-admin-on-surface-variant hover:text-admin-primary transition-colors p-1" title="Edit">
                                              <span className="material-symbols-outlined text-[20px]">edit</span>
                                          </button>
                                          <button onClick={() => handleDelete(bundle.id)} className="text-admin-on-surface-variant hover:text-admin-error transition-colors p-1" title="Delete">
                                              <span className="material-symbols-outlined text-[20px]">delete</span>
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>
      </div>
      
      {/* MODAL TAMBAH/EDIT BUNDLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant/30 rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
            <div className="sticky top-0 bg-admin-surface-container-lowest/90 backdrop-blur-md z-10 px-6 py-4 border-b border-admin-outline-variant/30 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-admin-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-admin-primary">{editingId ? 'edit_square' : 'card_giftcard'}</span>
                  {editingId ? 'Edit Paket Bundling' : 'Buat Paket Baru'}
              </h3>
              <button onClick={handleCancel} className="text-admin-on-surface-variant hover:text-admin-error transition-colors p-2 rounded-full hover:bg-admin-error/10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6">
              {pesanNotif && (
                  <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-start gap-3 ${pesanNotif.jenis === 'sukses' ? 'bg-admin-primary/10 text-admin-primary border border-admin-primary/30' : 'bg-admin-error-container/50 text-admin-error border border-admin-error/50'}`}>
                      <span className="material-symbols-outlined">{pesanNotif.jenis === 'sukses' ? 'check_circle' : 'error'}</span>
                      <p className="mt-0.5">{pesanNotif.teks}</p>
                  </div>
              )}
              
              <form onSubmit={handleSubmitBundle} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Bagian Kiri: Info Paket (5/12) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                      <ImageUpload 
                        defaultImage={formData.gambar_url} 
                        onUploadSuccess={(url) => setFormData({...formData, gambar_url: url})}
                      />
                      
                      <div>
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Nama Paket <span className="text-admin-error">*</span></label>
                          <input 
                              type="text" 
                              value={formData.nama_produk} onChange={(e) => setFormData({...formData, nama_produk: e.target.value})}
                              placeholder="Contoh: Paket Sarapan Ceria" 
                              className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                              required
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Harga Jual Paket <span className="text-admin-error">*</span></label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-sm font-medium">Rp</span>
                              <input 
                                  type="number" 
                                  value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})}
                                  placeholder="0" 
                                  className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                                  required
                              />
                          </div>
                          <p className="text-[11px] text-admin-on-surface-variant mt-1 flex justify-between">
                            <span>Bisa lebih murah dari total satuan</span>
                            <span className="font-semibold text-admin-primary">
                              Total Satuan: Rp {(formData.bundle_items.reduce((s,i) => s + (i.harga_satuan * i.jumlah), 0)).toLocaleString('id-ID')}
                            </span>
                          </p>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Deskripsi</label>
                          <textarea 
                              rows={3}
                              value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                              placeholder="Tuliskan isi atau promo paket ini..." 
                              className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-3 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none transition-all"
                          ></textarea>
                      </div>
                  </div>

                  {/* Bagian Kanan: Isi Paket (7/12) */}
                  <div className="lg:col-span-7 bg-admin-surface-container-low/50 border border-admin-outline-variant/30 rounded-2xl p-5 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-admin-on-surface">Isi Paket Bundling</label>
                      </div>
                      
                      <div className="relative mb-4">
                          <select 
                              onChange={handleAddBundleItem}
                              className="w-full appearance-none bg-admin-surface-container border border-admin-outline-variant/80 rounded-xl pl-4 pr-10 py-3 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all cursor-pointer font-medium shadow-sm"
                              defaultValue=""
                          >
                              <option value="" disabled>+ Pilih Produk untuk dimasukkan ke Paket...</option>
                              {allProducts.map(p => (
                                  <option key={p.id} value={p.id} disabled={formData.bundle_items.some(i => i.produk_id === p.id)}>
                                      {p.nama_produk} (Rp {p.harga.toLocaleString('id-ID')}) - Stok: {p.stok}
                                  </option>
                              ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-admin-outline">arrow_drop_down</span>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[250px] max-h-[350px]">
                        {formData.bundle_items.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-admin-on-surface-variant opacity-50 py-10">
                            <span className="material-symbols-outlined text-4xl mb-2">inventory</span>
                            <p className="text-sm">Belum ada produk di dalam paket ini.</p>
                          </div>
                        ) : (
                          formData.bundle_items.map(item => (
                            <div key={item.produk_id} className="bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl p-3 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-admin-on-surface truncate line-clamp-1">{item.nama_produk}</p>
                                <p className="text-[11px] text-admin-on-surface-variant mt-0.5">
                                  Rp {item.harga_satuan.toLocaleString('id-ID')} | Stok Toko: {item.stok_satuan}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-admin-on-surface-variant">Qty:</span>
                                <input 
                                  type="number" 
                                  min="1"
                                  value={item.jumlah}
                                  onChange={(e) => handleUpdateItemQty(item.produk_id, parseInt(e.target.value) || 1)}
                                  className="w-16 bg-admin-surface-container border border-admin-outline-variant/50 rounded-lg px-2 py-1 text-sm text-center focus:border-admin-primary outline-none"
                                />
                              </div>
                              <button type="button" onClick={() => handleRemoveBundleItem(item.produk_id)} className="text-admin-on-surface-variant hover:text-admin-error transition-colors p-1.5 bg-admin-surface-container hover:bg-admin-error/10 rounded-lg ml-1">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                  </div>
                  
                  <div className="lg:col-span-12 flex justify-end gap-3 mt-2 pt-5 border-t border-admin-outline-variant/30">
                      <button type="button" onClick={handleCancel} className="px-5 py-2.5 rounded-xl text-sm font-medium text-admin-on-surface hover:bg-admin-surface-container transition-colors">
                          Batal
                      </button>
                      <button type="submit" disabled={isSubmitting} className="bg-admin-primary text-admin-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-admin-primary-container disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(167,221,199,0.1)] hover:shadow-[0_0_20px_rgba(167,221,199,0.2)]">
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                          {editingId ? 'Simpan Perubahan' : 'Buat Paket'}
                      </button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
