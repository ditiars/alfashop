import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Kita pakai MySQL seperti di Checkout

// GET: Untuk mengambil data Omzet, Pesanan Baru, dan Status Toko
export async function GET() {
  try {
    // 1. Ambil status toko dari tabel pengaturan
    const pengaturan: any = await query('SELECT is_open FROM pengaturan WHERE id = 1');
    const isOpen = pengaturan.length > 0 ? Boolean(pengaturan[0].is_open) : true;

    // 2. Hitung Pesanan Baru (Status = 'Menunggu')
    const pesananBaruData: any = await query("SELECT COUNT(id) as total FROM pesanan WHERE status = 'Menunggu'");
    const pesananBaru = pesananBaruData[0].total;

    // 3. Hitung Omzet Hari Ini (Total Harga dari pesanan 'Selesai' hari ini)
    const omzetData: any = await query(`
      SELECT SUM(total_harga) as omzet 
      FROM pesanan 
      WHERE status = 'Selesai' 
      AND DATE(created_at) = CURDATE()
    `);
    const omzet = omzetData[0].omzet || 0;

    return NextResponse.json({ isOpen, pesananBaru, omzet });
  } catch (error: any) {
    console.error("Error API Dashboard:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Untuk mengubah status Toko (Buka/Tutup)
export async function POST(request: Request) {
  try {
    const { is_open } = await request.json();
    
    // Update nilai boolean di MySQL (1 untuk true, 0 untuk false)
    const statusDb = is_open ? 1 : 0;
    await query('UPDATE pengaturan SET is_open = ? WHERE id = 1', [statusDb]);

    return NextResponse.json({ success: true, message: 'Status toko diupdate' });
  } catch (error: any) {
    console.error("Error Update Toko:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}