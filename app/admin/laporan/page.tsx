'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, TrendingDown, ShoppingBag, Banknote, ReceiptText, Users, MoreVertical } from 'lucide-react';

export default function LaporanAdminPage() {
  const [semuaPesanan, setSemuaPesanan] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [grafikPeriode, setGrafikPeriode] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [filterWaktu, setFilterWaktu] = useState<'7 Hari Terakhir' | '30 Hari Terakhir' | 'Kuartal Ini' | 'Tahun Ini'>('7 Hari Terakhir');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/laporan');
      if (!res.ok) throw new Error('Gagal mengambil data laporan');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSemuaPesanan(data);
      } else {
        setSemuaPesanan(data.pesanan || []);
        setTopProducts(data.topProducts || []);
      }
    } catch (error) {
      console.error("Error memuat laporan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();

  // Filter Data Berdasarkan Waktu
  const dataTampil = semuaPesanan.filter(p => {
    const d = new Date(p.created_at);
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (filterWaktu === '7 Hari Terakhir') return diffDays <= 7;
    if (filterWaktu === '30 Hari Terakhir') return diffDays <= 30;
    if (filterWaktu === 'Kuartal Ini') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const orderQuarter = Math.floor(d.getMonth() / 3);
      return currentQuarter === orderQuarter && now.getFullYear() === d.getFullYear();
    }
    if (filterWaktu === 'Tahun Ini') return d.getFullYear() === now.getFullYear();
    return true;
  });

  // KPI Calculations
  const omzetHariIni = semuaPesanan.filter(p => new Date(p.created_at).toDateString() === now.toDateString()).reduce((acc, curr) => acc + curr.total_harga, 0);
  const totalOrders = dataTampil.length;
  const avgOrderValue = totalOrders > 0 ? dataTampil.reduce((acc, curr) => acc + curr.total_harga, 0) / totalOrders : 0;
  const activeCustomers = new Set(dataTampil.map(p => p.nama_pelanggan)).size;

  const generateChartData = () => {
    const dataTerurut = [...dataTampil].reverse(); 
    const groupedData: Record<string, number> = {};
    dataTerurut.forEach(order => {
      const d = new Date(order.created_at);
      let key = '';
      if (grafikPeriode === 'Harian') key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      else if (grafikPeriode === 'Mingguan') {
        const weekNum = Math.ceil(d.getDate() / 7);
        key = `Mgg ${weekNum} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
      }
      else if (grafikPeriode === 'Bulanan') key = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!groupedData[key]) groupedData[key] = 0;
      groupedData[key] += order.total_harga; 
    });
    
    return Object.keys(groupedData).map(key => ({ 
      tanggal: key, 
      total: groupedData[key] 
    }));
  };

  const handleExportCSV = () => {
    if (dataTampil.length === 0) return alert('Tidak ada data.');
    const headers = ['ID', 'Tanggal', 'Pelanggan', 'Total (Rp)'];
    const csvRows = [headers.join(','), ...dataTampil.map(o => [o.id, new Date(o.created_at).toLocaleString(), `"${o.nama_pelanggan}"`, o.total_harga].join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_AlfaShop_${filterWaktu.replace(/ /g, '_')}.csv`;
    link.click();
  };

  return (
    <main className="flex-1 px-6 md:px-12 py-8 w-full max-w-[1440px] mx-auto flex flex-col gap-6 font-body-md text-admin-on-surface">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-admin-on-surface tracking-tight">Laporan & Analitik</h2>
          <p className="text-sm font-medium text-admin-on-surface-variant mt-1">Ringkasan komprehensif kinerja toko.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filterWaktu}
            onChange={(e) => setFilterWaktu(e.target.value as any)}
            className="bg-admin-surface-container-high border border-admin-outline-variant/30 rounded-lg py-2.5 px-4 text-sm font-semibold text-admin-on-surface focus:outline-none focus:border-admin-primary-container focus:ring-1 focus:ring-admin-primary-container cursor-pointer"
          >
            <option>7 Hari Terakhir</option>
            <option>30 Hari Terakhir</option>
            <option>Kuartal Ini</option>
            <option>Tahun Ini</option>
          </select>
          <button 
            onClick={handleExportCSV}
            className="bg-admin-surface-container-highest border border-admin-outline-variant/30 text-admin-on-surface py-2.5 px-5 rounded-lg text-sm font-bold hover:bg-admin-surface-bright transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download size={16} /> Ekspor
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-[#1A2421] rounded-xl p-6 border border-admin-outline-variant/20 relative overflow-hidden group hover:border-admin-primary-container/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-admin-primary-container/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-admin-on-surface-variant">Pendapatan Hari Ini</span>
            <Banknote className="text-admin-primary-container" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-admin-on-surface">Rp {omzetHariIni.toLocaleString('id-ID')}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-admin-primary text-xs font-bold bg-admin-primary/10 px-2 py-0.5 rounded-full border border-admin-primary/20">
                <TrendingUp size={14} className="mr-1" /> 14.5%
              </span>
              <span className="text-xs font-medium text-admin-on-surface-variant">vs kemarin</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#1A2421] rounded-xl p-6 border border-admin-outline-variant/20 relative overflow-hidden hover:border-admin-primary-container/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-admin-on-surface-variant">Total Pesanan</span>
            <ShoppingBag className="text-admin-secondary" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-admin-on-surface">{totalOrders}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-admin-primary text-xs font-bold bg-admin-primary/10 px-2 py-0.5 rounded-full border border-admin-primary/20">
                <TrendingUp size={14} className="mr-1" /> 8.2%
              </span>
              <span className="text-xs font-medium text-admin-on-surface-variant">vs periode lalu</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#1A2421] rounded-xl p-6 border border-admin-outline-variant/20 relative overflow-hidden hover:border-admin-primary-container/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-admin-on-surface-variant">Rata-rata Nilai Pesanan</span>
            <ReceiptText className="text-admin-tertiary" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-admin-on-surface">Rp {Math.round(avgOrderValue).toLocaleString('id-ID')}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-admin-error text-xs font-bold bg-admin-error-container/20 px-2 py-0.5 rounded-full border border-admin-error/20">
                <TrendingDown size={14} className="mr-1" /> 2.1%
              </span>
              <span className="text-xs font-medium text-admin-on-surface-variant">vs periode lalu</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#1A2421] rounded-xl p-6 border border-admin-outline-variant/20 relative overflow-hidden hover:border-admin-primary-container/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-admin-on-surface-variant">Pelanggan Aktif</span>
            <Users className="text-admin-on-secondary-container" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-admin-on-surface">{activeCustomers}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-admin-primary text-xs font-bold bg-admin-primary/10 px-2 py-0.5 rounded-full border border-admin-primary/20">
                <TrendingUp size={14} className="mr-1" /> 5.4%
              </span>
              <span className="text-xs font-medium text-admin-on-surface-variant">vs periode lalu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section (Bento Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Main Trend Line Chart */}
        <div className="lg:col-span-2 bg-[#1A2421] rounded-xl p-6 border border-admin-outline-variant/20 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-admin-on-surface">Tren Pendapatan</h3>
              <span className="text-xs font-medium text-admin-on-surface-variant mt-1 block">Volume kotor harian</span>
            </div>
            <div className="flex gap-2">
              {['Harian', 'Mingguan', 'Bulanan'].map((p) => (
                <button 
                  key={p} 
                  onClick={() => setGrafikPeriode(p as any)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    grafikPeriode === p ? 'bg-[#2D5A4C] text-[#F2FBF8]' : 'bg-admin-surface-container-highest text-admin-on-surface hover:bg-admin-surface-bright'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-grow w-full relative">
            {isMounted && !isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A7DDC7" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#A7DDC7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-admin-outline-variant)" opacity={0.2} />
                  <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{fontSize: 11, fill:'var(--color-admin-on-surface-variant)'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill:'var(--color-admin-on-surface-variant)'}} tickFormatter={(v) => `Rp${v/1000}k`} />
                  <Tooltip 
                    cursor={{stroke: 'var(--color-admin-outline-variant)', strokeWidth: 1, strokeDasharray: '4 4'}}
                    contentStyle={{ backgroundColor: '#1A2421', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }} 
                    itemStyle={{ color: '#A7DDC7', fontWeight: 'bold' }} 
                    formatter={(v: any) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} 
                  />
                  <Area type="monotone" dataKey="total" stroke="#A7DDC7" strokeWidth={2} fillOpacity={1} fill="url(#chartGradient)" activeDot={{ r: 5, fill: '#A7DDC7', stroke: '#1A2421', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-admin-on-surface-variant text-sm font-medium animate-pulse">Memuat data grafik...</div>
            )}
          </div>
        </div>

        {/* Top Products / Bar Chart */}
        <div className="bg-[#1A2421] rounded-xl p-6 border border-admin-outline-variant/20 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-admin-on-surface">Produk Teratas</h3>
            <button className="text-admin-on-surface-variant hover:text-admin-primary transition-colors cursor-pointer p-1">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-5 flex-grow justify-center">
            {isLoading ? (
              <div className="text-sm font-medium text-admin-on-surface-variant text-center animate-pulse">Memuat produk...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-sm font-medium text-admin-on-surface-variant text-center">Belum ada data produk terjual.</div>
            ) : topProducts.map((item, i) => {
              const maxSales = topProducts[0]?.sales || 1;
              const width = Math.max(10, Math.round((item.sales / maxSales) * 100)) + '%';
              const colors = ['bg-admin-primary-container', 'bg-admin-secondary', 'bg-admin-tertiary', 'bg-admin-on-secondary-container', 'bg-admin-outline-variant'];
              const color = colors[i % colors.length];

              return (
              <div key={i}>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-admin-on-surface truncate pr-2">{item.name}</span>
                  <span className="text-admin-primary-container shrink-0">{item.sales}</span>
                </div>
                <div className="w-full bg-admin-surface-container h-2 rounded-full overflow-hidden">
                  <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width }}></div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[#1A2421] rounded-xl border border-admin-outline-variant/20 overflow-hidden mt-2">
        <div className="p-6 border-b border-admin-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-admin-on-surface">Transaksi Terakhir</h3>
          <a className="text-sm font-semibold text-admin-primary hover:underline cursor-pointer">Lihat Semua</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1E3D34]">
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">ID Pesanan</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Pelanggan</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Tanggal</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Jumlah</th>
                <th className="py-4 px-6 text-xs font-bold text-admin-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-admin-on-surface-variant">Memuat transaksi...</td></tr>
              ) : dataTampil.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-admin-on-surface-variant">Tidak ada transaksi terbaru ditemukan.</td></tr>
              ) : (
                dataTampil.slice(0, 5).map((trx) => {
                  const isCompleted = (trx.status || 'Selesai').toLowerCase() === 'selesai';
                  const isPending = (trx.status || '').toLowerCase() === 'menunggu';
                  const isProcessing = (trx.status || '').toLowerCase() === 'diproses';
                  
                  let badgeBg = 'bg-[#2D5A4C] text-[#F2FBF8]';
                  let badgeText = 'Selesai';
                  
                  if (isPending) {
                     badgeBg = 'bg-[#4A3B1A] text-[#FDE293]';
                     badgeText = 'Menunggu';
                  } else if (isProcessing) {
                     badgeBg = 'bg-[#2D4A5A] text-[#E2F3FD]';
                     badgeText = 'Diproses';
                  }

                  return (
                    <tr key={trx.id} className="border-b border-[#1E3D34] hover:bg-[#1E3D34]/50 transition-colors last:border-b-0">
                      <td className="py-4 px-6 text-admin-on-surface font-semibold">#ORD-{trx.id.toString().padStart(4, '0')}</td>
                      <td className="py-4 px-6 text-admin-on-surface-variant">{trx.nama_pelanggan}</td>
                      <td className="py-4 px-6 text-admin-on-surface-variant">{new Date(trx.created_at).toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                      <td className="py-4 px-6 text-admin-on-surface font-semibold">Rp {trx.total_harga.toLocaleString('id-ID')}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold opacity-90 ${badgeBg}`}>
                          {trx.status ? trx.status : badgeText}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}