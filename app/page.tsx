'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');

  const handleAuthAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const button = e.currentTarget;
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.8';
    
    setToastMessage('Mengarahkan ke halaman Login...');
    
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-[#eef2fc] font-sans overflow-hidden relative selection:bg-[#7c3aed] selection:text-white">
      {/* --- FLUID BACKGROUND & BLOBS --- */}
      {/* Gradient Dasar */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e4e7fd] via-[#f8efff] to-[#e8ebfd] z-0"></div>
      
      {/* Lingkaran blur besar (kiri atas) */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#d2d9fc] blur-3xl opacity-60 z-0"></div>
      {/* Lingkaran blur besar (kanan bawah) */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#ebdfff] blur-3xl opacity-60 z-0"></div>
      {/* Wavy shape abstract (svg overlay) */}
      <div className="absolute inset-0 z-0 opacity-[0.3]" style={{
        backgroundImage: 'radial-gradient(circle at 80% 20%, #c4b5fd 0%, transparent 40%), radial-gradient(circle at 20% 80%, #93c5fd 0%, transparent 40%)'
      }}></div>

      {/* Sphere hiasan melayang */}
      <div className="absolute top-[10%] left-[5%] w-16 h-16 rounded-full bg-gradient-to-tr from-[#9ba4f5] to-[#d6dcff] shadow-xl z-0" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
      <div className="absolute bottom-[10%] left-[25%] w-48 h-48 rounded-full bg-gradient-to-tr from-[#d6c7ff] to-[#f3efff] shadow-xl z-0" style={{ animation: 'float-delay 8s ease-in-out infinite', animationDelay: '1s' }}></div>
      <div className="absolute top-[20%] right-[5%] w-32 h-32 rounded-full bg-gradient-to-tr from-[#c7caff] to-[#f4f5ff] shadow-xl z-0" style={{ animation: 'float-reverse 7s ease-in-out infinite' }}></div>


      {/* --- NAVBAR --- */}
      <nav className="w-full relative z-20 px-6 md:px-20 py-8 flex justify-between items-center max-w-[1400px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#f97316] to-[#ec4899] flex items-center justify-center text-white font-bold text-xl italic shadow-md">
            e
          </div>
          <span className="font-bold text-[#5b21b6] text-xl md:text-2xl tracking-tight">
            AlfaShop
          </span>
        </div>

        {/* Nav Links - Dihilangkan sesuai permintaan agar clean */}
      </nav>

      {/* --- MAIN HERO SECTION --- */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-20 pt-10 md:pt-20 pb-20 flex flex-col md:flex-row items-center justify-between min-h-[calc(100vh-120px)]">
        
        {/* Kiri: Teks & Tombol */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left mb-16 md:mb-0 z-20">
          <h1 className="text-[42px] md:text-[64px] font-black leading-[1.1] tracking-tight mb-2">
            <span className="text-[#5b21b6] block drop-shadow-sm">E-COMMERCE</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] block">
              LANDING PAGE
            </span>
          </h1>
          
          <p className="text-[#475569] text-base md:text-lg max-w-[500px] mt-6 mb-10 leading-relaxed font-medium">
            Temukan kemudahan belanja online terbaik dengan AlfaShop. Platform modern yang dirancang untuk pengalaman belanja cepat, aman, dan memuaskan. Mulai kelola pesanan Anda sekarang.
          </p>

          <button 
            className="group relative bg-gradient-to-r from-[#1e3a8a] to-[#6d28d9] text-white font-bold px-10 md:px-12 py-4 md:py-5 rounded-full text-lg shadow-[0_10px_25px_-5px_rgba(109,40,217,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(109,40,217,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden" 
            onClick={handleAuthAction}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">Get Started</span>
          </button>

          {/* Decorative Dots di bawah tombol */}
          <div className="flex gap-2 mt-6 ml-4">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
            <div className="w-2 h-2 rounded-full bg-[#ec4899]"></div>
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
          </div>
        </div>

        {/* Kanan: 3D Isometric Elements */}
        <div className="w-full md:w-1/2 relative h-[500px] md:h-[600px] flex items-center justify-center perspective-[1000px]">
          
          {/* Main Container Isometric */}
          <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-100" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(55deg) rotateZ(-40deg)' }}>
            
            {/* 1. Base / Lantai Shadow */}
            <div className="absolute w-[300px] h-[500px] bg-black/10 blur-xl rounded-[40px] translate-x-10 translate-y-10 translate-z-[-50px]"></div>

            {/* 2. Smartphone 3D */}
            <div className="absolute w-[260px] h-[520px] rounded-[36px] bg-[#e2e8f0] shadow-2xl flex items-center justify-center" style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
              {/* Sisi Ketebalan HP (Kiri & Bawah) */}
              <div className="absolute inset-0 rounded-[36px] bg-[#cbd5e1] translate-x-[-15px] translate-y-[15px] translate-z-[-20px] shadow-2xl"></div>
              
              {/* Layar HP */}
              <div className="relative w-[240px] h-[500px] rounded-[28px] bg-gradient-to-b from-[#1e3a8a] via-[#7c3aed] to-[#ec4899] overflow-hidden flex flex-col items-center p-4 border-[4px] border-white" style={{ transform: 'translateZ(1px)' }}>
                {/* Speaker Grill */}
                <div className="w-16 h-2 bg-black/20 rounded-full mt-2 mb-6"></div>
                
                {/* App Grid */}
                <div className="grid grid-cols-3 gap-3 w-full px-2 mt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`w-full aspect-square rounded-xl ${i % 2 === 0 ? 'bg-gradient-to-br from-[#f97316] to-[#f59e0b]' : 'bg-gradient-to-br from-[#ec4899] to-[#f43f5e]'} shadow-sm`}></div>
                  ))}
                </div>

                {/* Buy Now Button di layar */}
                <div className="absolute bottom-16 w-32 h-10 bg-[#34d399] rounded-full shadow-lg flex items-center justify-center text-white font-bold text-sm tracking-wider">
                  BUY NOW
                </div>
                
                {/* Home indicator */}
                <div className="absolute bottom-4 w-20 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>

            {/* 3. Floating Credit Card */}
            <div className="absolute w-[200px] h-[120px] rounded-2xl bg-gradient-to-br from-[#f59e0b] via-[#f97316] to-[#ec4899] shadow-2xl flex flex-col justify-between p-4 border border-white/20 backdrop-blur-sm" 
                 style={{ transform: 'translateZ(180px) translateX(180px) translateY(80px)', animation: 'float 5s ease-in-out infinite' }}>
              <div className="w-10 h-8 bg-black/20 rounded-md"></div>
              <div className="flex flex-col gap-2">
                <div className="w-full h-2 bg-white/40 rounded-full"></div>
                <div className="w-2/3 h-2 bg-white/30 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="w-1/2 h-3 bg-white/50 rounded-sm"></div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-full bg-white/40"></div>
                  <div className="w-6 h-6 rounded-full bg-white/20 -ml-3"></div>
                </div>
              </div>
            </div>

            {/* 4. Floating Discount Badge (50%) */}
            <div className="absolute w-[120px] h-[120px] rounded-full bg-[#34d399] shadow-[0_20px_40px_rgba(52,211,153,0.4)] flex items-center justify-center border-4 border-white"
                 style={{ transform: 'translateZ(250px) translateX(150px) translateY(-180px)', animation: 'float-delay 6s ease-in-out infinite' }}>
              <span className="text-white font-black text-4xl" style={{ transform: 'rotateZ(40deg) rotateX(-55deg)' }}>50%</span>
            </div>

            {/* 5. Floating Shopping Bags */}
            {/* Bag 1 (Kiri) */}
            <div className="absolute w-[80px] h-[100px] bg-gradient-to-br from-[#f59e0b] to-[#ec4899] rounded-b-xl rounded-t-sm shadow-xl"
                 style={{ transform: 'translateZ(80px) translateX(-180px) translateY(50px)', animation: 'float-reverse 5s ease-in-out infinite' }}>
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-10 border-4 border-white/40 rounded-full border-b-transparent"></div>
            </div>
            {/* Bag 2 (Tengah) */}
            <div className="absolute w-[90px] h-[110px] bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-b-xl rounded-t-sm shadow-xl"
                 style={{ transform: 'translateZ(120px) translateX(-120px) translateY(120px)', animation: 'float 5.5s ease-in-out infinite' }}>
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-10 border-4 border-white/40 rounded-full border-b-transparent"></div>
            </div>

            {/* 6. Rating Box (Bintang) */}
            <div className="absolute w-[180px] h-[50px] bg-gradient-to-r from-[#f59e0b] to-[#ec4899] rounded-xl shadow-lg flex items-center justify-center gap-2 border border-white/30"
                 style={{ transform: 'translateZ(100px) translateX(60px) translateY(300px)', animation: 'float-delay 4s ease-in-out infinite' }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20" style={{ transform: 'rotateZ(40deg) rotateX(-55deg)' }}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>

            {/* 7. Coin / Dollar Badge */}
            <div className="absolute w-[60px] h-[60px] rounded-full bg-[#34d399] shadow-lg flex items-center justify-center border-2 border-white"
                 style={{ transform: 'translateZ(150px) translateX(250px) translateY(280px)', animation: 'float 4.5s ease-in-out infinite' }}>
              <span className="text-white font-black text-2xl" style={{ transform: 'rotateZ(40deg) rotateX(-55deg)' }}>$</span>
            </div>

            {/* 8. Small Decorative Dots Groups */}
            <div className="absolute flex gap-2" style={{ transform: 'translateZ(200px) translateX(280px) translateY(180px)' }}>
               <div className="w-2 h-2 bg-[#34d399] rounded-full"></div>
               <div className="w-2 h-2 bg-[#34d399] rounded-full"></div>
               <div className="w-2 h-2 bg-[#34d399] rounded-full"></div>
            </div>
            
            <div className="absolute flex gap-2" style={{ transform: 'translateZ(50px) translateX(-200px) translateY(-50px)' }}>
               <div className="w-2 h-2 bg-[#1e3a8a] rounded-full"></div>
               <div className="w-2 h-2 bg-[#1e3a8a] rounded-full"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toastMessage && (
          <div className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-3 font-semibold text-sm animate-in slide-in-from-bottom-5 fade-in duration-300 border border-white/20 backdrop-blur-md">
            <span className="material-symbols-outlined text-[18px]">info</span>
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
