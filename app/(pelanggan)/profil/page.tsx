'use client';
import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Edit2, Save, X, Loader2, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilPelangganPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pesanSukses, setPesanSukses] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    id: 1, // Pastikan ini nanti dinamis dari Session Login
    nama: '',
    whatsapp: '',
    alamat: '',
  });

  const [backupData, setBackupData] = useState(formData);

  useEffect(() => {
    // Ambil session login dari localStorage
    let userId = 1;
    const userLoggedIn = localStorage.getItem('user');
    if (userLoggedIn) {
      try {
        const user = JSON.parse(userLoggedIn);
        if (user.id) userId = user.id;
      } catch (e) {}
    }

    setFormData(prev => ({ ...prev, id: userId }));

    const fetchProfil = async () => {
      try {
        const res = await fetch(`/api/profil?id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const finalData = { ...data, id: userId };
          setFormData(finalData);
          setBackupData(finalData);
        }
      } catch (error) {
        console.error("Gagal menarik data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfil();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setErrorMsg(''); // Hilangkan error saat user mulai ngetik
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setFormData(backupData);
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleSave = async () => {
    // Validasi Sederhana
    if (!formData.nama.trim() || !formData.whatsapp.trim()) {
      setErrorMsg('Nama dan WhatsApp tidak boleh kosong!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Gagal update data');

      setBackupData(formData); 
      setIsEditing(false);
      setPesanSukses(true);
      setTimeout(() => setPesanSukses(false), 3000);

    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-[#500088] dark:text-[#c084fc]" size={36} />
        <p className="text-[#7e7383] dark:text-slate-400 text-sm font-medium animate-pulse">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-4 pb-8 animate-in fade-in duration-500 slide-in-from-bottom-4 transition-colors">
      <div className="w-full bg-white dark:bg-[#1e293b] rounded-3xl shadow-sm border border-[#cfc2d4]/30 dark:border-slate-700/80 overflow-hidden transition-colors">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#500088] via-[#7a00cc] to-[#9900ff] dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 p-6 text-white flex flex-col sm:flex-row justify-between items-center sm:items-start relative overflow-hidden gap-4 sm:gap-0 transition-colors">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#500088]/50 dark:bg-black/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 dark:border-white/10 shadow-inner shrink-0">
              <User size={32} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h2 className="text-xl font-black mb-0.5 line-clamp-1 tracking-tight">{backupData.nama || 'Pengguna'}</h2>
              <p className="text-white/90 text-[11px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full w-max mt-1">Pelanggan</p>
            </div>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="relative z-10 w-full sm:w-auto bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 backdrop-blur-md px-4 py-2.5 sm:p-2.5 rounded-2xl transition-all shadow-sm active:scale-95 flex justify-center items-center gap-2"
              title="Edit Profil"
            >
              <Edit2 size={20} className="text-white" />
              <span className="sm:hidden font-bold">Edit Profil</span>
            </button>
          )}
        </div>

        {/* Form / Detail Area */}
        <div className="p-6 space-y-5">
          
          {/* Notifikasi Alert - diletakkan di dalam agar lebih rapi */}
          {pesanSukses && (
            <div className="bg-[#ecfdf5] dark:bg-emerald-950/30 border border-[#059669]/20 dark:border-emerald-900/50 rounded-2xl p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="text-[#059669] dark:text-emerald-400 shrink-0" size={20} />
              <p className="text-sm font-bold text-[#059669] dark:text-emerald-400">Profil berhasil diperbarui!</p>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={20} />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}

          {/* Field: Nama */}
          <div className="group">
            <label className="text-xs font-black text-[#7e7383] dark:text-slate-400 uppercase flex items-center gap-2 mb-2 ml-1 tracking-wider">
              <User size={14} className={isEditing ? "text-[#500088] dark:text-[#c084fc]" : ""} /> Nama Lengkap
            </label>
            {isEditing ? (
              <input 
                type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Masukkan nama..."
                className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/50 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm focus:outline-none focus:border-[#500088] dark:focus:border-[#c084fc] focus:ring-4 focus:ring-[#500088]/10 dark:focus:ring-[#c084fc]/10 transition-all font-bold"
              />
            ) : (
              <div className="bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/30 dark:border-slate-700/80 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm font-bold transition-colors">
                {formData.nama || <span className="text-[#cfc2d4] dark:text-slate-500 italic font-medium">Belum diatur</span>}
              </div>
            )}
          </div>

          {/* Field: WhatsApp */}
          <div className="group">
            <label className="text-xs font-black text-[#7e7383] dark:text-slate-400 uppercase flex items-center gap-2 mb-2 ml-1 tracking-wider">
              <Phone size={14} className={isEditing ? "text-[#500088] dark:text-[#c084fc]" : ""} /> No. WhatsApp
            </label>
            {isEditing ? (
              <input 
                type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="08..."
                className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/50 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm focus:outline-none focus:border-[#500088] dark:focus:border-[#c084fc] focus:ring-4 focus:ring-[#500088]/10 dark:focus:ring-[#c084fc]/10 transition-all font-bold"
              />
            ) : (
              <div className="bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/30 dark:border-slate-700/80 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm font-bold transition-colors">
                {formData.whatsapp || <span className="text-[#cfc2d4] dark:text-slate-500 italic font-medium">Belum diatur</span>}
              </div>
            )}
          </div>

          {/* Field: Alamat */}
          <div className="group">
            <label className="text-xs font-black text-[#7e7383] dark:text-slate-400 uppercase flex items-center gap-2 mb-2 ml-1 tracking-wider">
              <MapPin size={14} className={isEditing ? "text-[#500088] dark:text-[#c084fc]" : ""} /> Alamat Pengiriman
            </label>
            {isEditing ? (
              <textarea 
                name="alamat" value={formData.alamat} onChange={handleChange} rows={3} placeholder="Tulis alamat lengkap..."
                className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/50 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm focus:outline-none focus:border-[#500088] dark:focus:border-[#c084fc] focus:ring-4 focus:ring-[#500088]/10 dark:focus:ring-[#c084fc]/10 transition-all resize-none font-bold"
              ></textarea>
            ) : (
              <div className="bg-[#f8f9fa] dark:bg-slate-900 border border-[#cfc2d4]/30 dark:border-slate-700/80 rounded-2xl px-4 py-3.5 text-[#191c1d] dark:text-slate-100 text-sm font-bold leading-relaxed min-h-[80px] transition-colors">
                {formData.alamat || <span className="text-[#cfc2d4] dark:text-slate-500 italic font-medium">Belum diatur</span>}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="p-6 pt-2 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#cfc2d4]/30 dark:border-slate-700 text-[#7e7383] dark:text-slate-300 font-black flex justify-center items-center gap-2 hover:bg-[#f8f9fa] dark:hover:bg-slate-800 hover:text-[#191c1d] dark:hover:text-slate-100 transition-colors disabled:opacity-50 active:scale-95 text-sm"
            >
              <X size={18} strokeWidth={2.5} /> Batal
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] py-3.5 px-4 rounded-2xl bg-[#500088] dark:bg-[#c084fc] text-white dark:text-slate-900 font-black flex justify-center items-center gap-2 hover:bg-[#7a00cc] dark:hover:bg-[#a855f7] shadow-[0px_8px_16px_rgba(80,0,136,0.2)] dark:shadow-none transition-all disabled:opacity-50 active:scale-95 text-sm"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
              {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        )}

        {/* Logout Button */}
        {!isEditing && (
          <div className="p-6 pt-2 flex animate-in fade-in slide-in-from-bottom-2">
            <button 
              onClick={() => {
                localStorage.removeItem('user'); // Hapus sesi
                router.push('/login'); // Kembali ke login
              }}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 font-black flex justify-center items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/80 transition-all active:scale-95 text-sm"
            >
              <LogOut size={18} strokeWidth={2.5} /> Keluar (Logout)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}