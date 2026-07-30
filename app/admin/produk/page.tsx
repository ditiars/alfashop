'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

// DAFTAR KATEGORI
const DAFTAR_KATEGORI = [
  'Beras & Sembako',
  'Minuman',
  'Makanan Ringan',
  'Mie & Instan',
  'Sabun & Deterjen',
  'Bumbu Dapur',
  'Lainnya'
];

export default function ManajemenProdukPage() {
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // STATE BARU: Filter Kategori
  // STATE BARU: Filter Kategori
  const [filterKategori, setFilterKategori] = useState('Semua Kategori');

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pesanNotif, setPesanNotif] = useState<{jenis: 'sukses' | 'error', teks: string} | null>(null);

  // State Modal & Bulk Action
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<number[]>([]);

  const initialFormData = {
    nama_produk: '',
    kategori: 'Lainnya',
    harga: '',
    satuan: 'Ecer',
    stok: '',
    gambar_url: '', 
    deskripsi: '',
    variasi: [] as { id?: number, nama_variasi: string, harga: string, stok: string, harga_grosir: string, min_grosir: string }[]
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produk?all=true');
      if (!res.ok) throw new Error('Gagal mengambil data produk');
      const data = await res.json();
      setProdukList(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (produk: any) => {
    setEditingId(produk.id);
    setFormData({
      nama_produk: produk.nama_produk,
      kategori: produk.kategori || 'Lainnya',
      harga: produk.harga.toString(),
      satuan: produk.satuan,
      stok: produk.stok?.toString() || '0',
      gambar_url: produk.gambar_url || '',
      deskripsi: produk.deskripsi || '',
      variasi: produk.variasi?.map((v: any) => ({
        id: v.id,
        nama_variasi: v.nama_variasi,
        harga: v.harga.toString(),
        stok: v.stok?.toString() || '0',
        harga_grosir: v.harga_grosir ? v.harga_grosir.toString() : '',
        min_grosir: v.min_grosir ? v.min_grosir.toString() : ''
      })) || []
    });
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanNotif(null);

    if (!formData.nama_produk || !formData.harga) {
      setPesanNotif({ jenis: 'error', teks: 'Nama dan Harga Produk wajib diisi!' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        nama_produk: formData.nama_produk,
        kategori: formData.kategori,
        harga: parseInt(formData.harga),
        satuan: formData.satuan,
        stok: parseInt(formData.stok) || 0,
        gambar_url: formData.gambar_url || null,
        deskripsi: formData.deskripsi || null,
        variasi: formData.variasi.map(v => ({
          nama_variasi: v.nama_variasi,
          harga: parseInt(v.harga),
          stok: parseInt(v.stok) || 0,
          harga_grosir: parseInt(v.harga_grosir) || null,
          min_grosir: parseInt(v.min_grosir) || null
        }))
      };

      if (editingId) {
        payload.id = editingId;
        const res = await fetch('/api/produk', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Gagal update produk');
        const data = await res.json();
        
        setProdukList(produkList.map(p => p.id === editingId ? data : p));
        setPesanNotif({ jenis: 'sukses', teks: 'Perubahan produk berhasil disimpan!' });
      } else {
        payload.tersedia = true;
        const res = await fetch('/api/produk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Gagal simpan produk baru');
        const data = await res.json();
        
        setProdukList([data, ...produkList]); 
        setPesanNotif({ jenis: 'sukses', teks: 'Produk baru berhasil ditambahkan.' });
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
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    
    try {
      const res = await fetch(`/api/produk?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProdukList(produkList.filter(p => p.id !== id));
        setSelectedProduk(selectedProduk.filter(selId => selId !== id));
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      alert("Gagal menghapus produk");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProduk.length === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedProduk.length} produk terpilih?`)) return;

    try {
        // Implementasi sederhana dengan loop (ideal nya API mendukung bulk delete)
        for (const id of selectedProduk) {
            await fetch(`/api/produk?id=${id}`, { method: 'DELETE' });
        }
        setProdukList(produkList.filter(p => !selectedProduk.includes(p.id)));
        setSelectedProduk([]);
    } catch (error) {
        alert("Gagal menghapus beberapa produk");
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
        setProdukList(produkList.map(p => p.id === id ? { ...p, tersedia: !currentStatus } : p));
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

  const filteredProduk = produkList.filter(p => {
    const namaProduk = p?.nama_produk || '';
    const matchSearch = namaProduk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'Semua Kategori' ? true : p?.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedProduk(filteredProduk.map(p => p.id));
    } else {
        setSelectedProduk([]);
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedProduk.includes(id)) {
        setSelectedProduk(selectedProduk.filter(pId => pId !== id));
    } else {
        setSelectedProduk([...selectedProduk, id]);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative w-full h-full text-admin-on-surface font-body-md">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
              <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Manajemen Produk</h2>
              <p className="text-admin-on-surface-variant mt-1 text-sm">Tambah barang baru dan kelola inventaris toko Anda</p>
          </div>
          <button 
              onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData(initialFormData); setPesanNotif(null); }}
              className="bg-admin-primary-container text-admin-on-primary-container hover:bg-admin-primary transition-colors font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(167,221,199,0.1)] hover:shadow-[0_0_20px_rgba(167,221,199,0.2)] text-sm"
          >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tambah Baru
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
                      placeholder="Cari produk..." 
                      className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 text-admin-on-surface rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-admin-primary-container focus:ring-1 focus:ring-admin-primary-container focus:outline-none transition-all placeholder:text-admin-on-surface-variant/50"
                  />
              </div>
              <div className="relative w-full sm:w-48">
                  <select 
                      value={filterKategori}
                      onChange={(e) => setFilterKategori(e.target.value)}
                      className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 text-admin-on-surface rounded-xl pl-4 pr-10 py-2.5 text-sm appearance-none focus:border-admin-primary-container focus:ring-1 focus:ring-admin-primary-container focus:outline-none transition-all cursor-pointer"
                  >
                      <option value="Semua Kategori">Semua Kategori</option>
                      {DAFTAR_KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant pointer-events-none">arrow_drop_down</span>
              </div>
          </div>
          <button className="border border-admin-outline-variant/50 text-admin-primary-container hover:bg-admin-surface-container transition-colors text-sm font-medium px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 w-full lg:w-auto">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export CSV
          </button>
      </div>

      {/* Data Table */}
      <div className="bg-admin-surface-container-low/30 rounded-2xl border border-admin-surface-container-high overflow-hidden shadow-lg mb-20">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                      <tr className="bg-admin-surface-container-high/50 text-admin-on-surface-variant text-xs uppercase tracking-wider font-semibold border-b border-admin-surface-container-high">
                          <th className="p-4 w-12 text-center">
                              <input 
                                  type="checkbox" 
                                  id="selectAll"
                                  checked={filteredProduk.length > 0 && selectedProduk.length === filteredProduk.length}
                                  onChange={handleSelectAll}
                                  className="rounded bg-admin-surface-container border-admin-outline-variant text-admin-primary focus:ring-admin-primary focus:ring-offset-admin-surface-container-low cursor-pointer w-4 h-4"
                              />
                          </th>
                          <th className="p-4">Produk</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4 text-right">Harga</th>
                          <th className="p-4">Stok</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-center">Aksi</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {isLoading ? (
                          <tr><td colSpan={7} className="p-8 text-center text-admin-on-surface-variant animate-pulse">Memuat data produk...</td></tr>
                      ) : filteredProduk.length === 0 ? (
                          <tr><td colSpan={7} className="p-8 text-center text-admin-on-surface-variant flex-col items-center flex justify-center"><span className="material-symbols-outlined text-4xl mb-2 text-admin-outline-variant">inventory_2</span><p>Tidak ada produk ditemukan.</p></td></tr>
                      ) : (
                          filteredProduk.map(produk => (
                              <tr key={produk.id} className="border-b border-admin-surface-container-high hover:bg-admin-surface-container transition-colors group">
                                  <td className="p-4 text-center">
                                      <input 
                                          type="checkbox"
                                          checked={selectedProduk.includes(produk.id)}
                                          onChange={() => handleSelectRow(produk.id)}
                                          className="rounded bg-admin-surface-container border-admin-outline-variant text-admin-primary focus:ring-admin-primary focus:ring-offset-admin-surface-container-low cursor-pointer w-4 h-4"
                                      />
                                  </td>
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-lg bg-admin-surface-container flex items-center justify-center overflow-hidden border border-admin-outline-variant/30 flex-shrink-0">
                                              {produk.gambar_url ? (
                                                  <img src={produk.gambar_url} alt={produk.nama_produk} className="w-full h-full object-cover" />
                                              ) : (
                                                  <span className="material-symbols-outlined text-admin-on-surface-variant">image</span>
                                              )}
                                          </div>
                                          <div>
                                              <p className={`font-semibold text-admin-on-surface ${!produk.tersedia && 'line-through text-admin-on-surface-variant'}`}>{produk.nama_produk}</p>
                                              <p className="text-xs text-admin-on-surface-variant mt-1">SKU: {produk.sku || `PRD-${produk.id}`}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4 text-admin-on-surface-variant">{produk.kategori || 'Lainnya'}</td>
                                  <td className="p-4 text-right font-medium">Rp {produk.harga.toLocaleString('id-ID')}</td>
                                  <td className="p-4">
                                      <div className="flex items-center gap-2">
                                          <span className={`font-medium w-8 ${produk.stok <= 0 ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'}`}>{produk.stok}</span>
                                          {produk.stok > 10 ? (
                                              <span className="px-2 py-0.5 rounded-full bg-admin-secondary-container text-admin-on-secondary-container text-[10px] uppercase tracking-wide border border-admin-secondary-container/50">In Stock</span>
                                          ) : produk.stok > 0 ? (
                                              <span className="px-2 py-0.5 rounded-full bg-[#4A3C1C] text-[#E5B567] text-[10px] uppercase tracking-wide border border-[#8C7335]">Low Stock</span>
                                          ) : (
                                              <span className="px-2 py-0.5 rounded-full bg-admin-error-container text-admin-error text-[10px] uppercase tracking-wide border border-admin-error/50">Out of Stock</span>
                                          )}
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" className="sr-only peer" checked={produk.tersedia} onChange={() => handleToggleStatus(produk.id, produk.tersedia, produk)} />
                                          <div className="w-9 h-5 bg-admin-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-on-surface-variant after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-admin-surface-container-lowest peer-checked:bg-admin-primary-container"></div>
                                      </label>
                                  </td>
                                  <td className="p-4">
                                      <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleEditClick(produk)} className="text-admin-on-surface-variant hover:text-admin-primary transition-colors p-1" title="Edit">
                                              <span className="material-symbols-outlined text-[20px]">edit</span>
                                          </button>
                                          <button onClick={() => handleDelete(produk.id)} className="text-admin-on-surface-variant hover:text-admin-error transition-colors p-1" title="Delete">
                                              <span className="material-symbols-outlined text-[20px]">delete</span>
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-admin-surface-container-high bg-admin-surface-container-lowest flex items-center justify-between">
              <p className="text-xs text-admin-on-surface-variant">Menampilkan {filteredProduk.length} produk</p>
              <div className="flex items-center gap-1 text-sm">
                  <button className="p-1 text-admin-on-surface-variant hover:text-admin-primary disabled:opacity-50 transition-colors" disabled>
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded bg-admin-primary-container text-admin-on-primary-container font-semibold flex items-center justify-center">1</button>
                  <button className="p-1 text-admin-on-surface-variant hover:text-admin-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
              </div>
          </div>
      </div>
      
      {/* Bulk Action Bar */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-admin-surface-container/80 backdrop-blur-xl border border-admin-outline-variant/30 rounded-full px-6 py-3 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-all duration-300 ${selectedProduk.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <span className="text-sm text-admin-on-surface font-medium"><span className="font-bold text-admin-primary">{selectedProduk.length}</span> item terpilih</span>
          <div className="h-5 w-px bg-admin-outline-variant/50"></div>
          <button onClick={handleBulkDelete} className="text-admin-error hover:bg-admin-error/10 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Hapus Terpilih
          </button>
          <button className="text-admin-primary-container hover:bg-admin-primary-container/10 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">rule</span>
              Ubah Status
          </button>
          <button onClick={() => setSelectedProduk([])} className="ml-2 p-1.5 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
      </div>

      {/* MODAL TAMBAH/EDIT PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant/30 rounded-2xl w-full max-w-3xl shadow-2xl relative my-8">
            <div className="sticky top-0 bg-admin-surface-container-lowest/90 backdrop-blur-md z-10 px-6 py-4 border-b border-admin-outline-variant/30 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-admin-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-admin-primary">{editingId ? 'edit_square' : 'add_box'}</span>
                  {editingId ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
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
              
              <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Kolom Foto (4/12) */}
                  <div className="md:col-span-4 flex flex-col gap-2">
                      <ImageUpload 
                        defaultImage={formData.gambar_url} 
                        onUploadSuccess={(url) => setFormData({...formData, gambar_url: url})}
                      />
                  </div>

                  {/* Kolom Form (8/12) */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Nama Produk <span className="text-admin-error">*</span></label>
                          <input 
                              id="productName" type="text" 
                              value={formData.nama_produk} onChange={(e) => setFormData({...formData, nama_produk: e.target.value})}
                              placeholder="Contoh: Kopi Instan Kapal Api" 
                              className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                              required
                          />
                      </div>

                      <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Kategori</label>
                          <div className="relative">
                              <select 
                                  value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                                  className="w-full appearance-none bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl pl-4 pr-10 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all cursor-pointer"
                              >
                                  {DAFTAR_KATEGORI.map(kat => (
                                      <option key={kat} value={kat}>{kat}</option>
                                  ))}
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-admin-outline">arrow_drop_down</span>
                          </div>
                      </div>

                      <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Harga Jual <span className="text-admin-error">*</span></label>
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
                      </div>

                      <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Satuan</label>
                          <div className="relative">
                              <select 
                                  value={formData.satuan} onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                                  className="w-full appearance-none bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl pl-4 pr-10 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all cursor-pointer"
                              >
                                  <option value="Ecer">Ecer (Pcs)</option>
                                  <option value="Renteng">Renteng</option>
                                  <option value="Kardus">Kardus (Karton)</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-admin-outline">arrow_drop_down</span>
                          </div>
                      </div>

                      <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Stok Awal</label>
                          <input 
                              type="number" 
                              value={formData.stok} onChange={(e) => setFormData({...formData, stok: e.target.value})}
                              placeholder="0" 
                              className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                          />
                      </div>

                      <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Deskripsi (Opsional)</label>
                          <textarea 
                              rows={3}
                              value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                              placeholder="Tuliskan deskripsi singkat produk..." 
                              className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-3 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none transition-all"
                          ></textarea>
                      </div>

                      {/* Variasi Produk */}
                      <div className="sm:col-span-2 border-t border-admin-outline-variant/30 pt-4 mt-2">
                          <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-admin-on-surface">Variasi Produk (Opsional)</label>
                            <button type="button" onClick={() => setFormData({...formData, variasi: [...formData.variasi, { nama_variasi: '', harga: '', stok: '', harga_grosir: '', min_grosir: '' }]})} className="bg-admin-primary-container text-admin-on-primary-container text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">add</span> Tambah Variasi
                            </button>
                          </div>
                          
                          {formData.variasi.map((v, index) => (
                              <div key={index} className="bg-admin-surface-container-low p-4 rounded-xl border border-admin-outline-variant/50 mb-3 relative group">
                                  <button type="button" onClick={() => { const newV = [...formData.variasi]; newV.splice(index, 1); setFormData({...formData, variasi: newV}); }} className="absolute -top-2 -right-2 bg-admin-error text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md scale-0 group-hover:scale-100 transition-transform">
                                      <span className="material-symbols-outlined text-[14px]">close</span>
                                  </button>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                      <div className="lg:col-span-1">
                                          <label className="block text-xs font-medium text-admin-on-surface mb-1">Nama Variasi <span className="text-admin-error">*</span></label>
                                          <input type="text" value={v.nama_variasi} onChange={(e) => { const newV = [...formData.variasi]; newV[index].nama_variasi = e.target.value; setFormData({...formData, variasi: newV}); }} className="w-full bg-white border border-admin-outline-variant/50 rounded-lg px-3 py-2 text-xs focus:border-admin-primary focus:outline-none" required placeholder="Cth: Merah" />
                                      </div>
                                      <div className="lg:col-span-1">
                                          <label className="block text-xs font-medium text-admin-on-surface mb-1">Harga Jual <span className="text-admin-error">*</span></label>
                                          <input type="number" value={v.harga} onChange={(e) => { const newV = [...formData.variasi]; newV[index].harga = e.target.value; setFormData({...formData, variasi: newV}); }} className="w-full bg-white border border-admin-outline-variant/50 rounded-lg px-3 py-2 text-xs focus:border-admin-primary focus:outline-none" required placeholder="0" />
                                      </div>
                                      <div className="lg:col-span-1">
                                          <label className="block text-xs font-medium text-admin-on-surface mb-1">Stok Variasi</label>
                                          <input type="number" value={v.stok} onChange={(e) => { const newV = [...formData.variasi]; newV[index].stok = e.target.value; setFormData({...formData, variasi: newV}); }} className="w-full bg-white border border-admin-outline-variant/50 rounded-lg px-3 py-2 text-xs focus:border-admin-primary focus:outline-none" placeholder="0" />
                                      </div>
                                      <div className="lg:col-span-1">
                                          <label className="block text-xs font-medium text-admin-on-surface mb-1">Harga Grosir (Ops)</label>
                                          <input type="number" value={v.harga_grosir} onChange={(e) => { const newV = [...formData.variasi]; newV[index].harga_grosir = e.target.value; setFormData({...formData, variasi: newV}); }} className="w-full bg-white border border-admin-outline-variant/50 rounded-lg px-3 py-2 text-xs focus:border-admin-primary focus:outline-none" placeholder="0" />
                                      </div>
                                      <div className="lg:col-span-1">
                                          <label className="block text-xs font-medium text-admin-on-surface mb-1">Min. Grosir (Ops)</label>
                                          <input type="number" value={v.min_grosir} onChange={(e) => { const newV = [...formData.variasi]; newV[index].min_grosir = e.target.value; setFormData({...formData, variasi: newV}); }} className="w-full bg-white border border-admin-outline-variant/50 rounded-lg px-3 py-2 text-xs focus:border-admin-primary focus:outline-none" placeholder="0" />
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  <div className="md:col-span-12 flex justify-end gap-3 mt-4 pt-4 border-t border-admin-outline-variant/30">
                      <button type="button" onClick={handleCancel} className="px-5 py-2.5 rounded-xl text-sm font-medium text-admin-on-surface hover:bg-admin-surface-container transition-colors">
                          Batal
                      </button>
                      <button type="submit" disabled={isSubmitting} className="bg-admin-primary text-admin-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-admin-primary-container disabled:opacity-50 transition-all flex items-center gap-2">
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                          {editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
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