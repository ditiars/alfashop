import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

// Tambahkan "any" di context untuk kompatibilitas Next.js terbaru
export async function GET(request: Request, context: any) {
  try {
    // Ambil ID dengan aman
    const params = await context.params;
    const idDicari = params.id;

    // Menjalankan perintah SQL
    const data: any = await query('SELECT * FROM produk WHERE id = ?', [idDicari]);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Produk ID ${idDicari} tidak ada di tabel!` }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    // Kalau MySQL error (misal salah nama kolom), kirim errornya ke layar!
    return NextResponse.json({ error: `Error Database: ${error.message}` }, { status: 500 });
  }
}