'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

type Banner = {
  id: number;
  judul: string | null;
  gambar_url: string;
  link_url: string | null;
  urutan: number;
  aktif: number;
  created_at: string;
};

export default function ManajemenBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [notif, setNotif] = useState<{ jenis: 'sukses' | 'error'; teks: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = { judul: '', gambar_url: '', link_url: '', urutan: '' };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setMounted(true);
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/banner');
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const openModal = (b?: Banner) => {
    if (b) {
      setEditingBanner(b);
      setFormData({
        judul: b.judul || '',
        gambar_url: b.gambar_url,
        link_url: b.link_url || '',
        urutan: b.urutan.toString(),
      });
    } else {
      setEditingBanner(null);
      setFormData(emptyForm);
    }
    setNotif(null);
    setIsModalOpen(true);
  };

  const handleUploadFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setNotif({ jenis: 'error', teks: 'Ukuran file terlalu besar! Maksimal 3MB.' });
      return;
    }
    setIsUploadingFoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, gambar_url: reader.result as string }));
      setIsUploadingFoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gambar_url) {
      setNotif({ jenis: 'error', teks: 'Gambar banner wajib diupload!' });
      return;
    }
    setIsSubmitting(true);
    setNotif(null);
    try {
      const payload: any = {
        judul: formData.judul || null,
        gambar_url: formData.gambar_url,
        link_url: formData.link_url || null,
        urutan: parseInt(formData.urutan) || 0,
      };
      if (editingBanner) {
        payload.id = editingBanner.id;
        payload.aktif = editingBanner.aktif;
      }

      const res = await fetch('/api/admin/banner', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      setNotif({ jenis: 'sukses', teks: editingBanner ? 'Banner berhasil diperbarui!' : 'Banner baru berhasil ditambahkan!' });
      setTimeout(() => { setIsModalOpen(false); fetchBanner(); }, 1200);
    } catch (err: any) {
      setNotif({ jenis: 'error', teks: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAktif = async (b: Banner) => {
    try {
      await fetch('/api/admin/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, aktif: b.aktif ? 0 : 1 }),
      });
      setBanners(banners.map(item => item.id === b.id ? { ...item, aktif: item.aktif ? 0 : 1 } : item));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus banner ini?')) return;
    await fetch(`/api/admin/banner?id=${id}`, { method: 'DELETE' });
    setBanners(banners.filter(b => b.id !== id));
  };

  const aktifCount = banners.filter(b => b.aktif).length;

  // Modal via Portal — render langsung ke document.body agar bebas dari overflow/clip parent
  const ModalContent = (
    <div
      className="flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: 'min(90vw, 540px)',
          backgroundColor: 'var(--color-admin-surface-container-lowest, #1a1a2e)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          margin: '2rem auto',
        }}
        className="bg-admin-surface-container-lowest border border-admin-outline-variant/30 rounded-2xl shadow-2xl"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-admin-outline-variant/30 flex items-center justify-between">
          <h3 className="text-lg font-bold text-admin-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-admin-primary">add_photo_alternate</span>
            {editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-admin-on-surface-variant hover:text-admin-error p-2 rounded-full hover:bg-admin-error/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {notif && (
            <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${notif.jenis === 'sukses' ? 'bg-admin-primary/10 text-admin-primary border border-admin-primary/30' : 'bg-admin-error-container/50 text-admin-error border border-admin-error/50'}`}>
              <span className="material-symbols-outlined text-[18px]">{notif.jenis === 'sukses' ? 'check_circle' : 'error'}</span>
              {notif.teks}
            </div>
          )}

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-admin-on-surface mb-2">
              Gambar Banner <span className="text-admin-error">*</span>
            </label>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUploadFoto} />
            <div
              onClick={() => !isUploadingFoto && fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed cursor-pointer hover:border-admin-primary transition-all overflow-hidden ${formData.gambar_url ? 'border-transparent' : 'border-admin-outline-variant/50 bg-admin-surface-container-low'}`}
              style={{ aspectRatio: '16/6' }}
            >
              {isUploadingFoto ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-admin-primary">
                  <Loader2 size={28} className="animate-spin mb-2" />
                  <p className="text-sm">Membaca gambar...</p>
                </div>
              ) : formData.gambar_url ? (
                <>
                  <img src={formData.gambar_url} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold">Klik untuk ganti</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-admin-on-surface-variant gap-1">
                  <span className="material-symbols-outlined text-4xl mb-1">cloud_upload</span>
                  <p className="text-sm font-medium">Klik untuk pilih gambar</p>
                  <p className="text-xs text-admin-on-surface-variant/70">PNG, JPG, WebP · Maks 3MB · Rasio 16:6 ideal</p>
                </div>
              )}
            </div>
            {formData.gambar_url && (
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, gambar_url: '' }))}
                className="mt-2 text-xs text-admin-error hover:underline"
              >
                Hapus gambar
              </button>
            )}
          </div>

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Judul Banner (Opsional)</label>
            <input
              type="text"
              value={formData.judul}
              onChange={e => setFormData(p => ({ ...p, judul: e.target.value }))}
              placeholder="Contoh: Promo Akhir Tahun"
              className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
            />
          </div>

          {/* Link + Urutan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Link URL (Opsional)</label>
              <input
                type="text"
                value={formData.link_url}
                onChange={e => setFormData(p => ({ ...p, link_url: e.target.value }))}
                placeholder="/produk"
                className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Urutan Tampil</label>
              <input
                type="number" min={0}
                value={formData.urutan}
                onChange={e => setFormData(p => ({ ...p, urutan: e.target.value }))}
                placeholder="0"
                className="w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-admin-outline-variant/30">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-admin-on-surface hover:bg-admin-surface-container transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFoto}
              className="bg-admin-primary text-admin-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2 hover:opacity-90"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {editingBanner ? 'Simpan Perubahan' : 'Tambah Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-full text-admin-on-surface font-body-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Pengaturan Banner</h2>
          <p className="text-admin-on-surface-variant mt-1 text-sm">Kelola gambar slider dan banner promo di halaman utama pelanggan.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-admin-primary-container text-admin-on-primary-container hover:bg-admin-primary transition-colors font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
          Tambah Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Total Banner', value: banners.length, icon: 'photo_library', color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
          { label: 'Banner Aktif', value: aktifCount, icon: 'visibility', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10' },
        ].map(s => (
          <div key={s.label} className="bg-admin-surface-container-low rounded-2xl p-5 border border-admin-outline-variant/30 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-[26px] icon-fill">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-admin-on-surface-variant uppercase tracking-wider font-medium">{s.label}</p>
              <p className="text-lg font-bold text-admin-on-surface mt-0.5">{isLoading ? '...' : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-admin-on-surface-variant animate-pulse">Memuat banner...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 text-admin-on-surface-variant bg-admin-surface-container-low/30 rounded-2xl border border-admin-surface-container-high border-dashed">
          <span className="material-symbols-outlined text-5xl text-admin-outline-variant mb-3 block">image</span>
          <p className="font-medium">Belum ada banner.</p>
          <p className="text-sm mt-1">Klik "Tambah Banner" untuk mulai mengelola tampilan halaman utama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all ${b.aktif ? 'border-admin-primary/30 shadow-md shadow-admin-primary/5' : 'border-admin-outline-variant/30 opacity-60'}`}
            >
              {/* Image */}
              <div className="aspect-[16/7] bg-admin-surface-container-high overflow-hidden relative">
                <img src={b.gambar_url} alt={b.judul || `Banner ${idx + 1}`} className="w-full h-full object-cover" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(b)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="bg-red-500/40 hover:bg-red-500/60 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span> Hapus
                  </button>
                </div>
                {/* Status badge */}
                <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${b.aktif ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30' : 'bg-black/40 text-white/70 border border-white/20'}`}>
                  {b.aktif ? '● Aktif' : '○ Nonaktif'}
                </div>
                {/* Urutan badge */}
                <div className="absolute top-2 right-2 bg-black/40 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                  #{b.urutan || idx + 1}
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-admin-surface-container-lowest p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-admin-on-surface text-sm truncate">{b.judul || 'Banner tanpa judul'}</p>
                  {b.link_url && (
                    <p className="text-xs text-admin-on-surface-variant truncate mt-0.5">{b.link_url}</p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0" title="Toggle aktif">
                  <input type="checkbox" className="sr-only peer" checked={!!b.aktif} onChange={() => handleToggleAktif(b)} />
                  <div className="w-9 h-5 bg-admin-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-on-surface-variant after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-admin-surface-container-lowest peer-checked:bg-admin-primary-container"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal via Portal — rendered at document.body to avoid overflow clipping */}
      {mounted && isModalOpen && createPortal(ModalContent, document.body)}
    </div>
  );
}
