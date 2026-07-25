'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, PackagePlus, List, Edit2, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const DAFTAR_KATEGORI = [
  'Beras & Sembako', 'Minuman', 'Makanan Ringan', 
  'Mie & Instan', 'Sabun & Deterjen', 'Bumbu Dapur', 'Lainnya'
];

export default function MobileProdukPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tambah' | 'daftar'>('tambah');
  
  // State Form
  const initialFormData = { nama_produk: '', kategori: 'Lainnya', harga: '', satuan: 'Ecer', stok: '', deskripsi: '', gambar_url: '' };
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // State Data
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/produk?all=true');
      const data = await res.json();
      setProdukList(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_produk || !formData.harga) {
      alert('Nama dan Harga wajib diisi!');
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
        deskripsi: formData.deskripsi || null
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
        alert('Produk berhasil diupdate!');
      } else {
        payload.tersedia = true;
        const res = await fetch('/api/produk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Gagal simpan produk');
        const data = await res.json();
        setProdukList([data, ...produkList]);
        alert('Produk baru berhasil ditambahkan!');
      }

      // Reset
      setFormData(initialFormData);
      setEditingId(null);
      // Pindah ke tab daftar jika tambah baru
      if (!editingId) setActiveTab('daftar');
      
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
      deskripsi: produk.deskripsi || ''
    });
    setActiveTab('tambah');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch(`/api/produk?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProdukList(produkList.filter(p => p.id !== id));
      }
    } catch (error) {
      alert("Gagal menghapus produk");
    }
  };

  const handleCancelEdit = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-admin-surface-container-lowest font-sans text-admin-on-surface overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-admin-primary text-admin-on-primary shadow-md z-10 shrink-0">
        <h1 className="text-lg font-bold">Admin Mobile</h1>
        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-admin-primary-container/20 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'tambah' && (
          <div className="p-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Camera Component */}
              <div className="bg-admin-surface-container rounded-2xl p-4 shadow-sm border border-admin-outline-variant/30">
                <ImageUpload 
                  defaultImage={formData.gambar_url} 
                  onUploadSuccess={(url) => setFormData({...formData, gambar_url: url})}
                />
              </div>

              {/* Form Fields */}
              <div className="bg-admin-surface-container-low rounded-2xl p-4 shadow-sm border border-admin-outline-variant/30 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Produk <span className="text-admin-error">*</span></label>
                  <input 
                    type="text" required
                    value={formData.nama_produk} onChange={(e) => setFormData({...formData, nama_produk: e.target.value})}
                    placeholder="Contoh: Indomie Goreng" 
                    className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl px-4 py-3 text-[15px] focus:border-admin-primary outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga <span className="text-admin-error">*</span></label>
                    <input 
                      type="number" required
                      value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})}
                      placeholder="0" 
                      className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl px-4 py-3 text-[15px] focus:border-admin-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stok Awal</label>
                    <input 
                      type="number" 
                      value={formData.stok} onChange={(e) => setFormData({...formData, stok: e.target.value})}
                      placeholder="0" 
                      className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl px-4 py-3 text-[15px] focus:border-admin-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select 
                      value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                      className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl px-3 py-3 text-[15px] focus:border-admin-primary outline-none"
                    >
                      {DAFTAR_KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Satuan</label>
                    <select 
                      value={formData.satuan} onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                      className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl px-3 py-3 text-[15px] focus:border-admin-primary outline-none"
                    >
                      <option value="Ecer">Ecer</option>
                      <option value="Renteng">Renteng</option>
                      <option value="Kardus">Kardus</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea 
                    rows={2}
                    value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    placeholder="Opsional..." 
                    className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/50 rounded-xl px-4 py-3 text-[15px] focus:border-admin-primary outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="flex-1 py-3.5 rounded-xl font-semibold bg-admin-surface-container text-admin-on-surface">
                    Batal Edit
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3.5 rounded-xl font-bold bg-admin-primary text-admin-on-primary shadow-lg shadow-admin-primary/30 flex justify-center items-center gap-2">
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'daftar' && (
          <div className="p-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold mb-4">Daftar Produk ({produkList.length})</h2>
            
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="text-center py-10 flex flex-col items-center gap-2 text-admin-on-surface-variant">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Memuat...</span>
                </div>
              ) : produkList.length === 0 ? (
                <div className="text-center py-10 text-admin-on-surface-variant">Belum ada produk.</div>
              ) : (
                produkList.map((p) => (
                  <div key={p.id} className="bg-admin-surface-container-low p-3 rounded-2xl shadow-sm border border-admin-outline-variant/30 flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl bg-admin-surface-container flex-shrink-0 overflow-hidden border border-admin-outline-variant/20">
                      {p.gambar_url ? (
                        <img src={p.gambar_url} alt={p.nama_produk} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-admin-on-surface-variant">
                          <PackagePlus size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] line-clamp-1">{p.nama_produk}</h3>
                      <p className="text-admin-primary font-semibold text-sm">Rp {p.harga.toLocaleString('id-ID')}</p>
                      <p className="text-admin-on-surface-variant text-xs mt-0.5">Stok: {p.stok} {p.satuan}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditClick(p)} className="p-2 rounded-lg bg-admin-secondary-container text-admin-on-secondary-container">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-admin-error/10 text-admin-error">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-admin-surface-container-low border-t border-admin-outline-variant/30 px-6 py-2 pb-safe flex justify-around items-center z-20">
        <button 
          onClick={() => setActiveTab('tambah')}
          className={`flex flex-col items-center gap-1 p-2 w-20 transition-colors ${activeTab === 'tambah' ? 'text-admin-primary' : 'text-admin-on-surface-variant'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'tambah' ? 'bg-admin-primary-container text-admin-on-primary-container' : ''}`}>
            <PackagePlus size={24} strokeWidth={activeTab === 'tambah' ? 2.5 : 2} />
          </div>
          <span className="text-[11px] font-medium">Input</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('daftar')}
          className={`flex flex-col items-center gap-1 p-2 w-20 transition-colors ${activeTab === 'daftar' ? 'text-admin-primary' : 'text-admin-on-surface-variant'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'daftar' ? 'bg-admin-primary-container text-admin-on-primary-container' : ''}`}>
            <List size={24} strokeWidth={activeTab === 'daftar' ? 2.5 : 2} />
          </div>
          <span className="text-[11px] font-medium">Daftar</span>
        </button>
      </nav>
    </div>
  );
}
