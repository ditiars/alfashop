'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotifAdmin() {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showBatalPopup, setShowBatalPopup] = useState(false);
  const [pesananBaru, setPesananBaru] = useState<any>(null);
  const [pesananBatal, setPesananBatal] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const lastOrderId = useRef<number | null>(null);
  const lastBatalTime = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const playSound = () => {
    const audio = new Audio('/notif.mp3');
    audio.play().catch(e => console.log('Browser butuh klik pertama untuk mutar suara', e));
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const cekPesanan = async () => {
      try {
        const res = await fetch('/api/admin/pesanan-baru');
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            if (lastOrderId.current === null) {
              lastOrderId.current = data.id;
            } else if (data.id > lastOrderId.current) {
              lastOrderId.current = data.id;
              setPesananBaru(data);
              setHasUnread(true);
              setShowPopup(true);
              
              setNotifications(prev => [{
                type: 'baru',
                id: data.id,
                title: 'Pesanan Baru Masuk!',
                message: `Dari: ${data.nama_pelanggan} - Rp ${data.total_harga?.toLocaleString('id-ID')}`,
                time: new Date(),
                data: data
              }, ...prev].slice(0, 10)); // Keep max 10

              playSound();

              setTimeout(() => {
                setShowPopup(false);
              }, 4000);
            }
          }
        }
      } catch (error) {
        console.error("Gagal cek pesanan:", error);
      }
    };

    const cekBatal = async () => {
      try {
        const res = await fetch('/api/admin/batal-baru');
        if (res.ok) {
          const data = await res.json();
          if (data && data.updated_at) {
            if (lastBatalTime.current === null) {
              lastBatalTime.current = data.updated_at;
            } else if (new Date(data.updated_at).getTime() > new Date(lastBatalTime.current).getTime()) {
              lastBatalTime.current = data.updated_at;
              setPesananBatal(data);
              setHasUnread(true);
              setShowBatalPopup(true);
              
              setNotifications(prev => [{
                type: 'batal',
                id: data.id,
                title: 'Pesanan Dibatalkan!',
                message: `Oleh: ${data.nama_pelanggan} (Order #${data.id})`,
                time: new Date(),
                data: data
              }, ...prev].slice(0, 10));

              playSound();

              setTimeout(() => {
                setShowBatalPopup(false);
              }, 4000);
            }
          }
        }
      } catch (error) {
        console.error("Gagal cek pesanan batal:", error);
      }
    };

    const interval = setInterval(() => {
      cekPesanan();
      cekBatal();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleKlikDetail = (id: number, type: 'baru' | 'batal') => {
    setTimeout(() => {
      if (type === 'baru') setShowPopup(false);
      if (type === 'batal') setShowBatalPopup(false);
      setHasUnread(false);
      setIsDropdownOpen(false);
      router.push(`/admin/pesanan/${id}`);
    }, 50);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setHasUnread(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell size={24} />
        {hasUnread && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Notifikasi */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-gray-50 border-b border-gray-100 p-4">
            <h3 className="font-bold text-gray-800">Notifikasi</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                <Bell size={32} className="text-gray-300" />
                <p className="text-sm font-medium">Belum ada notif masuk</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif, index) => (
                  <div 
                    key={index}
                    onClick={() => handleKlikDetail(notif.id, notif.type)}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors ${notif.type === 'baru' ? 'border-l-4 border-l-[#630ed4]' : 'border-l-4 border-l-red-500'}`}
                  >
                    <div className={`p-2 rounded-full shrink-0 ${notif.type === 'baru' ? 'bg-[#f1dbff] text-[#630ed4]' : 'bg-red-100 text-red-500'}`}>
                      {notif.type === 'baru' ? <ShoppingBag size={18} /> : <X size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{notif.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {notif.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popup Pesanan Baru */}
      {showPopup && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
          <div 
            onClick={() => handleKlikDetail(pesananBaru?.id, 'baru')}
            className="bg-white border-l-4 border-[#630ed4] shadow-xl rounded-xl p-4 w-80 cursor-pointer hover:bg-gray-50 flex items-start gap-4 transition-all"
          >
            <div className="bg-[#f1dbff] p-2 rounded-full text-[#630ed4]">
              <ShoppingBag size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">Pesanan Baru Masuk!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Dari: <span className="font-semibold">{pesananBaru?.nama_pelanggan}</span>
              </p>
              <p className="text-xs font-bold text-[#630ed4] mt-1">
                Rp {pesananBaru?.total_harga?.toLocaleString('id-ID')}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                setTimeout(() => setShowPopup(false), 50);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Popup Pesanan Dibatalkan */}
      {showBatalPopup && (
        <div className="fixed top-36 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
          <div 
            onClick={() => handleKlikDetail(pesananBatal?.id, 'batal')}
            className="bg-white border-l-4 border-red-500 shadow-xl rounded-xl p-4 w-80 cursor-pointer hover:bg-gray-50 flex items-start gap-4 transition-all"
          >
            <div className="bg-red-100 p-2 rounded-full text-red-500">
              <X size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">Pesanan Dibatalkan!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Oleh: <span className="font-semibold">{pesananBatal?.nama_pelanggan}</span>
              </p>
              <p className="text-xs font-bold text-red-500 mt-1">
                Order #{pesananBatal?.id}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                setTimeout(() => setShowBatalPopup(false), 50);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
