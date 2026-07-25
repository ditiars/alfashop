import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; 

export async function GET() {
  try {
    const batalTerbaru: any = await query(
      'SELECT id, nama_pelanggan, total_harga, updated_at FROM pesanan WHERE status = "Dibatalkan" ORDER BY updated_at DESC LIMIT 1'
    );
    
    return NextResponse.json(batalTerbaru[0] || null, { status: 200 });
  } catch (error: any) {
    console.error("Error DB Batal Baru:", error.message);
    return NextResponse.json({ error: 'Gagal cek batal' }, { status: 500 });
  }
}
