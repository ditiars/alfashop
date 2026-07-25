'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Home } from 'lucide-react';
import Link from 'next/link';

export default function SuksesPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0f172a] text-[#191c1d] dark:text-slate-100 min-h-screen flex items-center justify-center overflow-hidden font-sans transition-colors duration-300">
      
      {/* --- Mobile Constraint Container --- */}
      <main className="w-full max-w-[428px] min-h-screen relative flex flex-col items-center justify-center px-4 z-10">
        
        {/* --- Abstract Background Glows --- */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-[#f1dbff]/60 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-80 animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 bg-[#ffb0cd]/50 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse delay-700"></div>
          <div className="absolute top-[40%] left-[20%] w-48 h-48 bg-[#f1dbff]/40 dark:bg-purple-800/20 rounded-full mix-blend-multiply filter blur-[60px] opacity-60 animate-pulse delay-1000"></div>
        </div>

        {/* --- Success Content Canvas --- */}
        <div className="relative z-10 flex flex-col items-center text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-[#e1e3e4]/50 dark:border-slate-700/50 shadow-[0px_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none w-full transition-colors">
          
          {/* Icon Container with Custom Glow Animation */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Decorative background rings */}
            <div className="absolute w-32 h-32 bg-[#f1dbff] dark:bg-purple-900/50 rounded-full animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] opacity-30"></div>
            <div className="absolute w-24 h-24 bg-[#dfb7ff] dark:bg-purple-800/40 rounded-full opacity-30"></div>
            
            {/* Main Icon */}
            <CheckCircle2 size={80} className="text-[#500088] dark:text-[#c084fc] relative z-10 drop-shadow-sm" strokeWidth={2} />
          </div>

          {/* Typography */}
          <h1 className="text-[26px] font-bold text-[#500088] dark:text-slate-100 mb-2 tracking-tight leading-tight">
            Pesanan Berhasil<br/>Diproses
          </h1>
          <p className="text-[16px] text-[#4c4452] dark:text-slate-300 mb-8 max-w-[280px]">
            Terima kasih! Pesanan Anda sedang kami siapkan dan akan segera dikirimkan.
          </p>

          {/* Action Button */}
          <button 
            onClick={() => router.push('/beranda')}
            className="w-full bg-[#f1dbff] dark:bg-[#c084fc] text-[#500088] dark:text-slate-900 font-bold py-3.5 rounded-xl hover:bg-[#e4c2f7] dark:hover:bg-[#a855f7] active:scale-95 transition-all shadow-[0px_4px_12px_rgba(80,0,136,0.2)] dark:shadow-[0px_4px_12px_rgba(192,132,252,0.2)] flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Kembali ke Beranda
          </button>

          {/* Secondary Action Link */}
          <Link 
            href="/riwayat" 
            className="mt-6 text-[14px] text-[#500088] dark:text-[#c084fc] font-semibold hover:underline underline-offset-4"
          >
            Lihat Detail Pesanan
          </Link>
          
        </div>
      </main>
    </div>
  );
}