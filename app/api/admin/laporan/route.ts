import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Path koneksi MySQL

export async function GET() {
  try {
    // 1. Ambil semua pesanan dengan status 'Selesai'
    const pesananSelesai = await query(`
      SELECT * FROM pesanan 
      WHERE status = 'Selesai' 
      ORDER BY created_at DESC
    `);
    
    // 2. Ambil 5 produk teratas (paling banyak terjual) dari pesanan yang 'Selesai'
    const topProducts = await query(`
      SELECT p.nama_produk as name, SUM(dp.jumlah) as sales
      FROM detail_pesanan dp
      JOIN pesanan ps ON dp.pesanan_id = ps.id
      JOIN produk p ON dp.produk_id = p.id
      WHERE ps.status = 'Selesai'
      GROUP BY p.id, p.nama_produk
      ORDER BY sales DESC
      LIMIT 5
    `);
    
    return NextResponse.json({
      pesanan: pesananSelesai,
      topProducts: topProducts
    });
  } catch (error: any) {
    console.error("🔥 Error API Laporan:", error.message);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan dari database' }, 
      { status: 500 }
    );
  }
}