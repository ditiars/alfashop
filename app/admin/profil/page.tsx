'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pesanSukses, setPesanSukses] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    role: '',
  });

  const [backupData, setBackupData] = useState(formData);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = '/login';
      return;
    }
    const user = JSON.parse(userStr);
    
    const fetchProfil = async () => {
      try {
        const res = await fetch(`/api/admin/profil?id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
          setBackupData(data);
        }
      } catch (error) {
        console.error("Gagal menarik data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfil();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setFormData(backupData);
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMsg('Nama tidak boleh kosong!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Gagal update data');

      setBackupData(formData); 
      // Update local storage user name too
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = formData.name;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
      }
      
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
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-admin-primary" size={36} />
        <p className="text-admin-on-surface-variant font-label-md animate-pulse">Memuat profil admin...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 bg-admin-background">
      <div className="max-w-3xl mx-auto">
        <div className="bg-admin-surface rounded-3xl shadow-sm border border-admin-outline-variant/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-admin-primary-container p-6 md:p-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
              <div className="w-20 h-20 bg-admin-surface rounded-full flex items-center justify-center border-4 border-admin-surface shadow-sm shrink-0 overflow-hidden">
                <span className="material-symbols-outlined text-[40px] text-admin-on-primary-container">admin_panel_settings</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-admin-on-primary-container">{backupData.name || 'Admin'}</h2>
                <p className="text-admin-primary font-label-md uppercase tracking-wider">{backupData.role}</p>
              </div>
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto bg-admin-primary text-admin-on-primary px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-admin-primary/90 transition-all font-label-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profil
              </button>
            )}
          </div>

          <div className="p-8 space-y-6">
            {pesanSukses && (
              <div className="bg-[#ecfdf5] border border-[#059669]/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="text-[#059669] shrink-0" size={20} />
                <p className="font-label-md text-[#059669]">Profil berhasil diperbarui!</p>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="font-label-md text-red-600">{errorMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-md text-admin-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">person</span> Nama Lengkap
                </label>
                {isEditing ? (
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Admin"
                    className="w-full bg-admin-surface-container border border-admin-outline-variant/50 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all font-medium"
                  />
                ) : (
                  <div className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/30 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface font-medium">
                    {formData.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-admin-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">mail</span> Email Login
                </label>
                {isEditing ? (
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Admin"
                    className="w-full bg-admin-surface-container border border-admin-outline-variant/50 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all font-medium"
                  />
                ) : (
                  <div className="w-full bg-admin-surface-container-highest border border-admin-outline-variant/30 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface-variant cursor-not-allowed font-medium opacity-80">
                    {formData.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-admin-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">call</span> No. WhatsApp
                </label>
                {isEditing ? (
                  <input 
                    type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="08..."
                    className="w-full bg-admin-surface-container border border-admin-outline-variant/50 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all font-medium"
                  />
                ) : (
                  <div className="w-full bg-admin-surface-container-lowest border border-admin-outline-variant/30 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface font-medium">
                    {formData.whatsapp || <span className="italic text-admin-on-surface-variant">Belum diatur</span>}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <label className="font-label-md text-admin-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">lock</span> Kata Sandi Baru
                  </label>
                  <input 
                    type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kosongkan jika tidak diubah"
                    className="w-full bg-admin-surface-container border border-admin-outline-variant/50 rounded-xl px-4 py-3.5 font-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all font-medium"
                  />
                  <p className="text-[12px] text-admin-on-surface-variant/70 mt-1">*Kosongkan jika tidak ingin mengubah sandi</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-6 border-t border-admin-outline-variant/30 mt-8">
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3.5 rounded-xl border-2 border-admin-outline-variant text-admin-on-surface-variant font-label-md flex justify-center items-center gap-2 hover:bg-admin-surface-container transition-colors disabled:opacity-50 active:scale-95 flex-1 md:flex-none"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span> Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3.5 rounded-xl bg-admin-primary text-admin-on-primary font-label-md flex justify-center items-center gap-2 hover:bg-admin-primary/90 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] transition-colors disabled:opacity-50 active:scale-95 flex-[2] md:flex-none"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <span className="material-symbols-outlined text-[18px]">save</span>}
                  Simpan Perubahan
                </button>
              </div>
            )}

          </div>
          <div className="p-6 md:p-8 pt-0 flex justify-center">
             <button 
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl border-2 border-admin-error text-admin-error font-label-md flex justify-center items-center gap-2 hover:bg-admin-error/10 transition-colors active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span> Keluar (Logout)
              </button>
          </div>
        </div>
      </div>
    </main>
  );
}
