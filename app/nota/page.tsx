'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, Loader2 } from 'lucide-react';

function NotaContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/nota/${orderId}`)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!data) return <div className="text-center p-10">Data nota tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 flex flex-col items-center">
      {/* Tombol Cetak (Hilang saat diprint) */}
      <button 
        onClick={() => window.print()}
        className="print:hidden mb-4 flex items-center gap-2 bg-[#500088] text-white px-6 py-3 rounded-xl font-bold shadow-lg"
      >
        <Printer size={20} /> Cetak Nota Sekarang
      </button>

      {/* Kertas Nota Thermal */}
      <div className="bg-white p-4 w-[300px] text-black font-mono text-[12px] leading-tight shadow-md print:shadow-none">
        <div className="text-center mb-3">
          <h1 className="text-[16px] font-bold uppercase">AlfaShop</h1>
          <p className="text-[10px]">Sembako & Kebutuhan Pokok</p>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>
        
        <div className="flex justify-between text-[10px]">
          <span>Tgl: {new Date(data.created_at).toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Nota: #ORD-{data.id.toString().padStart(4, '0')}</span>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="space-y-2">
          {data.items.map((item: any, idx: number) => (
            <div key={idx}>
              <div className="font-bold uppercase">{item.nama_produk}</div>
              <div className="flex justify-between pl-2">
                <span>{item.jumlah} x {item.subtotal / item.jumlah}</span>
                <span>{item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="flex justify-between font-bold text-[14px]">
          <span>TOTAL</span>
          <span>Rp {data.total_harga.toLocaleString('id-ID')}</span>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="text-center mt-4 uppercase text-[10px]">
          Terima Kasih Atas Kunjungan Anda<br/>
          Barang yang sudah dibeli tidak dapat ditukar
        </div>
      </div>
    </div>
  );
}

export default function NotaDinamis() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
      <NotaContent />
    </Suspense>
  );
}