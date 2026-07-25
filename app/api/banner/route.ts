import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET: Ambil banner yang aktif (untuk halaman pelanggan)
export async function GET() {
  try {
    const rows = await query(
      'SELECT id, judul, gambar_url, link_url, urutan FROM banner WHERE aktif = 1 ORDER BY urutan ASC, created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    // Jika tabel belum ada, kembalikan array kosong (graceful degradation)
    console.error('Error API Banner Pelanggan:', error.message);
    return NextResponse.json([]);
  }
}
