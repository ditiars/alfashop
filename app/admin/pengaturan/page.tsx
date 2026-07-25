'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

type Settings = {
  is_open: number;
  ongkir: number;
  no_rekening: string;
  nama_bank: string;
  whatsapp_admin: string;
  nama_toko: string;
  alamat_toko: string;
};

const defaultSettings: Settings = {
  is_open: 1,
  ongkir: 0,
  no_rekening: '',
  nama_bank: '',
  whatsapp_admin: '',
  nama_toko: 'AlfaShop',
  alamat_toko: '',
};

export default function PengaturanTokoPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState<{ jenis: 'sukses' | 'error'; teks: string } | null>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pengaturan');
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data });
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotif(null);
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      setNotif({ jenis: 'sukses', teks: 'Pengaturan toko berhasil disimpan!' });
    } catch (err: any) {
      setNotif({ jenis: 'error', teks: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const inputClass = "w-full bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-admin-on-surface focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all placeholder:text-admin-on-surface-variant/50";

  return (
    <div className="w-full text-admin-on-surface font-body-md max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Pengaturan Toko</h2>
        <p className="text-admin-on-surface-variant mt-1 text-sm">
          Konfigurasi ongkos kirim, rekening bank, dan nomor WhatsApp notifikasi.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-admin-on-surface-variant">
          <Loader2 className="animate-spin mr-3" size={24} /> Memuat pengaturan...
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* Notif */}
          {notif && (
            <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${notif.jenis === 'sukses' ? 'bg-admin-primary/10 text-admin-primary border border-admin-primary/30' : 'bg-admin-error-container/50 text-admin-error border border-admin-error/50'}`}>
              <span className="material-symbols-outlined">{notif.jenis === 'sukses' ? 'check_circle' : 'error'}</span>
              {notif.teks}
            </div>
          )}

          {/* Section: Info Toko */}
          <section className="bg-admin-surface-container-low/60 border border-admin-outline-variant/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-admin-primary/10 flex items-center justify-center text-admin-primary">
                <span className="material-symbols-outlined icon-fill">storefront</span>
              </div>
              <div>
                <h3 className="font-semibold text-admin-on-surface">Informasi Toko</h3>
                <p className="text-xs text-admin-on-surface-variant">Identitas toko yang tampil ke pelanggan</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Nama Toko</label>
                <input
                  type="text"
                  value={settings.nama_toko}
                  onChange={e => field('nama_toko', e.target.value)}
                  placeholder="AlfaShop"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Alamat Toko</label>
                <textarea
                  rows={3}
                  value={settings.alamat_toko}
                  onChange={e => field('alamat_toko', e.target.value)}
                  placeholder="Jl. Contoh No. 123, Kota..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </section>

          {/* Section: Pengiriman */}
          <section className="bg-admin-surface-container-low/60 border border-admin-outline-variant/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-admin-tertiary/10 flex items-center justify-center text-admin-tertiary">
                <span className="material-symbols-outlined icon-fill">local_shipping</span>
              </div>
              <div>
                <h3 className="font-semibold text-admin-on-surface">Pengiriman</h3>
                <p className="text-xs text-admin-on-surface-variant">Biaya ongkos kirim standar untuk semua pesanan</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Biaya Ongkos Kirim (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-sm font-semibold">Rp</span>
                <input
                  type="number" min={0}
                  value={settings.ongkir}
                  onChange={e => setSettings(prev => ({ ...prev, ongkir: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className={`${inputClass} pl-12`}
                />
              </div>
              <p className="text-xs text-admin-on-surface-variant mt-1.5">Masukkan 0 jika ongkir gratis.</p>
            </div>
          </section>

          {/* Section: Pembayaran */}
          <section className="bg-admin-surface-container-low/60 border border-admin-outline-variant/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80]">
                <span className="material-symbols-outlined icon-fill">account_balance</span>
              </div>
              <div>
                <h3 className="font-semibold text-admin-on-surface">Rekening Pembayaran</h3>
                <p className="text-xs text-admin-on-surface-variant">Nomor rekening yang akan ditampilkan ke pelanggan saat checkout</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Nama Bank</label>
                <input
                  type="text"
                  value={settings.nama_bank}
                  onChange={e => field('nama_bank', e.target.value)}
                  placeholder="BCA / BNI / Mandiri / BSI..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Nomor Rekening</label>
                <input
                  type="text"
                  value={settings.no_rekening}
                  onChange={e => field('no_rekening', e.target.value)}
                  placeholder="1234567890"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Section: Notifikasi */}
          <section className="bg-admin-surface-container-low/60 border border-admin-outline-variant/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                <span className="material-symbols-outlined icon-fill">chat</span>
              </div>
              <div>
                <h3 className="font-semibold text-admin-on-surface">Notifikasi Admin</h3>
                <p className="text-xs text-admin-on-surface-variant">Nomor WhatsApp yang menerima notifikasi pesanan baru</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-on-surface mb-1.5">Nomor WhatsApp Admin</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-sm font-semibold">+62</span>
                <input
                  type="text"
                  value={settings.whatsapp_admin}
                  onChange={e => field('whatsapp_admin', e.target.value)}
                  placeholder="812xxxxxxxx"
                  className={`${inputClass} pl-14`}
                />
              </div>
              <p className="text-xs text-admin-on-surface-variant mt-1.5">Gunakan format tanpa angka 0 di depan. Contoh: <code className="bg-admin-surface-container px-1.5 py-0.5 rounded">81234567890</code></p>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-admin-on-surface hover:bg-admin-surface-container border border-admin-outline-variant/30 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-admin-primary text-admin-on-primary px-8 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-admin-primary/20"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <span className="material-symbols-outlined text-[18px]">save</span>}
              Simpan Pengaturan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
