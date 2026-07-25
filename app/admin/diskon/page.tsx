'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

type Voucher = {
  id: number;
  kode: string | null;
  jenis: 'persen' | 'nominal';
  nilai: number;
  min_belanja: number;
  max_diskon: number | null;
  kuota: number | null;
  digunakan: number;
  aktif: number;
  berlaku_sampai: string | null;
  created_at: string;
  produk_id: number | null;
};

type Produk = {
  id: number;
  nama_produk: string;
  harga: number;
};

const emptyForm = {
  kode: '',
  jenis: 'persen' as 'persen' | 'nominal',
  nilai: '',
  min_belanja: '',
  max_diskon: '',
  kuota: '',
  berlaku_sampai: '',
  produk_id: '',
};

export default function ManajemenDiskonPage() {
  const [list, setList] = useState<Voucher[]>([]);
  const [products, setProducts] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notif, setNotif] = useState<{ jenis: 'sukses' | 'error'; teks: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchVoucher();
    fetchProduk();
  }, []);

  const fetchVoucher = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/voucher');
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchProduk = async () => {
    try {
      const res = await fetch('/api/produk');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const openModal = (v?: Voucher) => {
    if (v) {
      setEditingId(v.id);
      setFormData({
        kode: v.kode || '',
        jenis: v.jenis,
        nilai: v.nilai.toString(),
        min_belanja: v.min_belanja?.toString() || '',
        max_diskon: v.max_diskon?.toString() || '',
        kuota: v.kuota?.toString() || '',
        berlaku_sampai: v.berlaku_sampai ? v.berlaku_sampai.split('T')[0] : '',
        produk_id: v.produk_id?.toString() || '',
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setNotif(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotif(null);
    try {
      const payload: any = {
        kode: formData.jenis === 'persen' ? formData.kode : null,
        jenis: formData.jenis,
        nilai: parseInt(formData.nilai) || 0,
        min_belanja: parseInt(formData.min_belanja) || 0,
        max_diskon: formData.max_diskon ? parseInt(formData.max_diskon) : null,
        kuota: formData.kuota ? parseInt(formData.kuota) : null,
        berlaku_sampai: formData.berlaku_sampai || null,
        produk_id: formData.jenis === 'nominal' ? parseInt(formData.produk_id) : null,
      };
      if (editingId) {
        payload.id = editingId;
        payload.aktif = list.find(v => v.id === editingId)?.aktif ?? 1;
      }

      const res = await fetch('/api/admin/voucher', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      setNotif({ jenis: 'sukses', teks: editingId ? 'Promo berhasil diperbarui!' : 'Promo baru berhasil dibuat!' });
      setTimeout(() => { setIsModalOpen(false); fetchVoucher(); }, 1200);
    } catch (err: any) {
      setNotif({ jenis: 'error', teks: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAktif = async (v: Voucher) => {
    try {
      await fetch('/api/admin/voucher', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, aktif: v.aktif ? 0 : 1 }),
      });
      setList(list.map(item => item.id === v.id ? { ...item, aktif: item.aktif ? 0 : 1 } : item));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus promo ini?')) return;
    await fetch(`/api/admin/voucher?id=${id}`, { method: 'DELETE' });
    setList(list.filter(v => v.id !== id));
  };

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const isExpired = (tgl: string | null) => tgl ? new Date(tgl) < new Date() : false;

  const aktifCount = list.filter(v => v.aktif).length;
  const totalDigunakan = list.reduce((s, v) => s + v.digunakan, 0);

  const inputCls = "w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all";

  const ModalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{ width: 'min(92vw, 560px)', margin: '2rem auto' }}
        className="bg-admin-surface-container-lowest border border-admin-outline-variant/30 rounded-2xl shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-admin-outline-variant/30 flex items-center justify-between">
          <h3 className="text-lg font-bold text-admin-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-admin-primary">{editingId ? 'edit_square' : 'add_circle'}</span>
            {editingId ? 'Edit Promo' : 'Buat Promo Baru'}
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-admin-on-surface-variant hover:text-admin-error transition-colors p-2 rounded-full hover:bg-admin-error/10"
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

          <div>
            <label className="block text-sm font-medium text-admin-on-surface mb-2">Tipe Promo</label>
            <div className="grid grid-cols-2 gap-3">
              {(['persen', 'nominal'] as const).map(j => (
                <label
                  key={j}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${formData.jenis === j ? 'border-admin-primary bg-admin-primary/10' : 'border-admin-outline-variant/50 hover:border-admin-primary/50'}`}
                >
                  <input
                    type="radio" name="jenis" value={j}
                    checked={formData.jenis === j}
                    onChange={() => setFormData({ ...formData, jenis: j })}
                    className="sr-only"
                  />
                  <span className={`material-symbols-outlined text-[20px] ${formData.jenis === j ? 'text-admin-primary' : 'text-admin-on-surface-variant'}`}>
                    {j === 'persen' ? 'loyalty' : 'sell'}
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${formData.jenis === j ? 'text-admin-primary' : 'text-admin-on-surface-variant'}`}>
                      {j === 'persen' ? 'Voucher Keranjang (%)' : 'Promo Produk (Rp)'}
                    </span>
                    <span className="text-xs text-admin-on-surface-variant mt-0.5">
                      {j === 'persen' ? 'Pakai kode di checkout' : 'Langsung potong harga'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {formData.jenis === 'persen' ? (
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">
                Kode Voucher <span className="text-admin-error">*</span>
              </label>
              <input
                type="text"
                value={formData.kode}
                onChange={e => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                placeholder="Contoh: ALFA10"
                className={`${inputCls} font-mono uppercase tracking-widest`}
                required={formData.jenis === 'persen'}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">
                Pilih Produk Promo <span className="text-admin-error">*</span>
              </label>
              <select
                value={formData.produk_id}
                onChange={e => setFormData({ ...formData, produk_id: e.target.value })}
                className={inputCls}
                required={formData.jenis === 'nominal'}
              >
                <option value="">-- Pilih Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_produk} ({formatRupiah(p.harga)})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">
                {formData.jenis === 'persen' ? 'Nilai Diskon (%)' : 'Potongan Harga (Rp)'} <span className="text-admin-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-sm font-semibold">
                  {formData.jenis === 'persen' ? '%' : 'Rp'}
                </span>
                <input
                  type="number" min={1}
                  value={formData.nilai}
                  onChange={e => setFormData({ ...formData, nilai: e.target.value })}
                  placeholder="0"
                  className={`${inputCls} pl-9`}
                  required
                />
              </div>
            </div>

            {formData.jenis === 'persen' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Min. Belanja</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-sm font-semibold">Rp</span>
                    <input
                      type="number" min={0}
                      value={formData.min_belanja}
                      onChange={e => setFormData({ ...formData, min_belanja: e.target.value })}
                      placeholder="0"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Maks. Diskon</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-sm font-semibold">Rp</span>
                    <input
                      type="number" min={0}
                      value={formData.max_diskon}
                      onChange={e => setFormData({ ...formData, max_diskon: e.target.value })}
                      placeholder="Kosong = bebas"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>
              </>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Kuota Promo</label>
              <input
                type="number" min={0}
                value={formData.kuota}
                onChange={e => setFormData({ ...formData, kuota: e.target.value })}
                placeholder="Kosong = tak terbatas"
                className={inputCls}
              />
            </div>

            <div className={formData.jenis === 'persen' ? '' : 'col-span-2'}>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Berlaku Sampai</label>
              <input
                type="date"
                value={formData.berlaku_sampai}
                onChange={e => setFormData({ ...formData, berlaku_sampai: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

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
              disabled={isSubmitting}
              className="bg-admin-primary text-admin-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2 hover:opacity-90"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {editingId ? 'Simpan Perubahan' : 'Buat Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-full text-admin-on-surface font-body-md">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Diskon & Promo</h2>
          <p className="text-admin-on-surface-variant mt-1 text-sm">Kelola voucher diskon dan harga coret (promo khusus produk).</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-admin-primary-container text-admin-on-primary-container hover:bg-admin-primary transition-colors font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-lg hover:shadow-admin-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Buat Promo Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Promo', value: list.length, icon: 'confirmation_number', color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
          { label: 'Promo Aktif', value: aktifCount, icon: 'check_circle', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10' },
          { label: 'Total Digunakan', value: `${totalDigunakan}×`, icon: 'local_activity', color: 'text-admin-tertiary', bg: 'bg-admin-tertiary/10' },
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

      <div className="bg-admin-surface-container-low/30 rounded-2xl border border-admin-surface-container-high overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-admin-surface-container-high/50 text-admin-on-surface-variant text-xs uppercase tracking-wider font-semibold border-b border-admin-surface-container-high">
                <th className="p-4">Tipe Promo / Item</th>
                <th className="p-4">Diskon</th>
                <th className="p-4">Min. Belanja</th>
                <th className="p-4 text-center">Kuota</th>
                <th className="p-4 text-center">Terpakai</th>
                <th className="p-4">Berlaku Sampai</th>
                <th className="p-4 text-center">Aktif</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-admin-surface-container-high">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center animate-pulse text-admin-on-surface-variant">Memuat data promo...</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-admin-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block text-admin-outline-variant">confirmation_number</span>
                    Belum ada promo. Klik "Buat Promo Baru" untuk memulai.
                  </td>
                </tr>
              ) : list.map(v => {
                const expired = isExpired(v.berlaku_sampai);
                const prod = products.find(p => p.id === v.produk_id);
                return (
                  <tr key={v.id} className="hover:bg-admin-surface-container transition-colors group">
                    <td className="p-4">
                      {v.jenis === 'persen' ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs bg-admin-primary/10 text-admin-primary px-2 py-0.5 rounded border border-admin-primary/20 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[14px]">loyalty</span> Voucher
                          </span>
                          <span className="font-mono font-bold tracking-widest">{v.kode}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[14px]">sell</span> Flash Sale
                          </span>
                          <span className="font-semibold text-admin-on-surface">{prod ? prod.nama_produk : 'Produk Dihapus'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-admin-on-surface">
                      {v.jenis === 'persen' ? (
                        <span>
                          {v.nilai}%
                          {v.max_diskon ? (
                            <span className="text-xs text-admin-on-surface-variant font-normal ml-1"><br/>(maks {formatRupiah(v.max_diskon)})</span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-orange-400">- {formatRupiah(v.nilai)}</span>
                      )}
                    </td>
                    <td className="p-4 text-admin-on-surface-variant">
                      {v.jenis === 'persen' && v.min_belanja > 0 ? formatRupiah(v.min_belanja) : <span className="italic text-xs">-</span>}
                    </td>
                    <td className="p-4 text-center text-admin-on-surface-variant">
                      {v.kuota != null ? v.kuota : <span className="text-lg">∞</span>}
                    </td>
                    <td className="p-4 text-center font-medium text-admin-on-surface">{v.digunakan}</td>
                    <td className="p-4">
                      {v.berlaku_sampai ? (
                        <span className={expired ? 'text-admin-error text-xs font-medium' : 'text-admin-on-surface-variant text-sm'}>
                          {expired && '⚠ '}
                          {new Date(v.berlaku_sampai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="italic text-xs text-admin-on-surface-variant">Tidak terbatas</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={!!v.aktif} onChange={() => handleToggleAktif(v)} />
                        <div className="w-9 h-5 bg-admin-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-on-surface-variant after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-admin-surface-container-lowest peer-checked:bg-admin-primary-container"></div>
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(v)}
                          className="text-admin-on-surface-variant hover:text-admin-primary transition-colors p-1.5 rounded-lg hover:bg-admin-surface-container"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="text-admin-on-surface-variant hover:text-admin-error transition-colors p-1.5 rounded-lg hover:bg-admin-error/10"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {mounted && isModalOpen && createPortal(ModalContent, document.body)}
    </div>
  );
}
