'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Smartphone, ShoppingBag, EyeOff, Eye, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', whatsapp: '', password: ''
  });

  // PROTEKSI TAMBAHAN: Kalau user sudah login, langsung tendang ke Beranda
  useEffect(() => {
    const userLoggedIn = localStorage.getItem('user');
    if (userLoggedIn) {
      const userData = JSON.parse(userLoggedIn);
      if (userData.role === 'admin') {
        if (window.innerWidth < 768) {
          router.push('/admin/mobile-produk');
        } else {
          router.push('/admin');
        }
      } else {
        router.push('/beranda'); // Lempar pelanggan ke Beranda
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // KUNCI PENTING: Simpan data user ke localStorage (Browser)
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Beritahu seluruh aplikasi kalau ada yang baru login
          window.dispatchEvent(new Event('storage'));
          
          if (data.user.role === 'admin') {
            if (window.innerWidth < 768) {
              router.push('/admin/mobile-produk');
            } else {
              router.push('/admin');
            }
          } else {
            router.push('/beranda'); // Masuk ke Katalog
          }
        } else {
          alert('Berhasil mendaftar! Silakan masuk dengan email kamu bosku.');
          setIsLogin(true); // Geser tab ke mode Login
          setFormData({ ...formData, password: '' }); // Kosongkan password
        }
      } else {
        alert(data.error || 'Terjadi kesalahan!');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col justify-center items-center px-4 py-8 font-sans text-[#191c1d]">
      <main className="w-full max-w-md flex flex-col">
        
        {/* --- Header / Logo --- */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#f1dbff] rounded-2xl flex items-center justify-center mb-3 shadow-sm">
            <ShoppingBag className="text-[#500088]" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-[#500088] tracking-tight">AlfaShop</h1>
          <p className="text-sm text-[#4c4452] mt-1 text-center">Belanja cepat, mudah, dan premium.</p>
        </div>

        {/* --- Auth Card --- */}
        <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col border border-gray-100">
          
          {/* Tabs */}
          <div className="flex w-full border-b border-[#e1e3e4]">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-center text-[15px] font-semibold transition-colors focus:outline-none ${
                isLogin 
                ? 'text-[#500088] border-b-2 border-[#500088] bg-white' 
                : 'text-[#7e7383] border-b-2 border-transparent bg-[#f8f9fa]/50 hover:bg-[#f3f4f5]'
              }`}
            >
              Masuk
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-center text-[15px] font-semibold transition-colors focus:outline-none ${
                !isLogin 
                ? 'text-[#500088] border-b-2 border-[#500088] bg-white' 
                : 'text-[#7e7383] border-b-2 border-transparent bg-[#f8f9fa]/50 hover:bg-[#f3f4f5]'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Form Area */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Form Input Ekstra untuk Register */}
              {!isLogin && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-[#4c4452] uppercase tracking-wider ml-1">Nama Lengkap</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 text-[#7e7383] z-10" size={20} />
                      <input 
                        required={!isLogin} type="text" placeholder="Masukkan nama Anda"
                        className="w-full bg-[#f8f9fa] border border-[#cfc2d4] rounded-2xl py-3 pl-12 pr-4 text-[15px] text-[#191c1d] placeholder:text-[#7e7383] focus:border-[#500088] focus:ring-1 focus:ring-[#500088] outline-none transition-all"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-[#4c4452] uppercase tracking-wider ml-1">Nomor WhatsApp</label>
                    <div className="relative flex items-center">
                      <Smartphone className="absolute left-4 text-[#7e7383] z-10" size={20} />
                      <input 
                        required={!isLogin} type="tel" placeholder="0812..."
                        className="w-full bg-[#f8f9fa] border border-[#cfc2d4] rounded-2xl py-3 pl-12 pr-4 text-[15px] text-[#191c1d] placeholder:text-[#7e7383] focus:border-[#500088] focus:ring-1 focus:ring-[#500088] outline-none transition-all"
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Input: Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#4c4452] uppercase tracking-wider ml-1">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-[#7e7383] z-10" size={20} />
                  <input 
                    required type="email" placeholder="nama@email.com"
                    className="w-full bg-[#f8f9fa] border border-[#cfc2d4] rounded-2xl py-3 pl-12 pr-4 text-[15px] text-[#191c1d] placeholder:text-[#7e7383] focus:border-[#500088] focus:ring-1 focus:ring-[#500088] outline-none transition-all"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#4c4452] uppercase tracking-wider ml-1">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-[#7e7383] z-10" size={20} />
                  <input 
                    required type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={formData.password}
                    className="w-full bg-[#f8f9fa] border border-[#cfc2d4] rounded-2xl py-3 pl-12 pr-12 text-[15px] text-[#191c1d] placeholder:text-[#7e7383] focus:border-[#500088] focus:ring-1 focus:ring-[#500088] outline-none transition-all"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#7e7383] hover:text-[#500088] focus:outline-none transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Lupa Password Link (Hanya di mode Login) */}
              {isLogin && (
                <div className="flex justify-end mt-[-4px]">
                  <a href="#" className="text-[13px] text-[#500088] font-semibold hover:underline">
                    Lupa Password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#500088] text-white text-[15px] font-bold py-3.5 rounded-xl mt-2 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0px_4px_12px_rgba(80,0,136,0.2)] disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Masuk' : 'Daftar Sekarang')}
              </button>
            </form>
          </div>
        </div>

        {/* --- Bottom Toggle Text --- */}
        <div className="mt-6 flex justify-center items-center gap-1">
          <span className="text-[14px] text-[#4c4452]">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
          </span>
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[14px] font-semibold text-[#500088] hover:underline focus:outline-none"
          >
            {isLogin ? 'Daftar' : 'Masuk'}
          </button>
        </div>

      </main>
    </div>
  );
}