import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  try {
    // 1. Hitung total semua pesanan user (berdasarkan Nama/WA atau ID jika sudah ada relasi)
    // Untuk Alfashop, kita asumsikan filter berdasarkan nama_pelanggan dari data user
    const user: any = await query('SELECT name FROM users WHERE id = ?', [userId]);
    const userName = user[0]?.name;

    const totalOrders: any = await query(
      'SELECT COUNT(*) as total FROM pesanan WHERE nama_pelanggan = ?', [userName]
    );

    const activeOrders: any = await query(
      'SELECT COUNT(*) as total FROM pesanan WHERE nama_pelanggan = ? AND status = ?', 
      [userName, 'Proses']
    );

    return NextResponse.json({
      total: totalOrders[0].total || 0,
      aktif: activeOrders[0].total || 0,
      poin: (totalOrders[0].total || 0) * 10 // Contoh: 1 pesanan = 10 poin
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}