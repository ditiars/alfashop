import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET: Ambil semua pelanggan + total belanja mereka
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.whatsapp,
        u.role,
        u.created_at,
        COUNT(DISTINCT p.id)          AS total_pesanan,
        COALESCE(SUM(CASE WHEN p.status = 'Selesai' THEN p.total_harga ELSE 0 END), 0) AS total_belanja
      FROM users u
      LEFT JOIN pesanan p ON p.whatsapp = u.whatsapp
      WHERE u.role = 'pelanggan'
        AND (u.name LIKE ? OR u.email LIKE ? OR u.whatsapp LIKE ?)
      GROUP BY u.id
      ORDER BY total_belanja DESC
    `;
    const like = `%${search}%`;
    const rows: any = await query(sql, [like, like, like]);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error API Pelanggan:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
