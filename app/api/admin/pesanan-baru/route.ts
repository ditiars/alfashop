import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; 

export async function GET() {
  try {
    // 🔥 PERBAIKAN: Menggunakan nama_pelanggan dan total_harga sesuai database
    const pesananTerbaru: any = await query(
      'SELECT id, nama_pelanggan, total_harga FROM pesanan ORDER BY id DESC LIMIT 1'
    );
    
    return NextResponse.json(pesananTerbaru[0] || null, { status: 200 });
  } catch (error: any) {
    console.error("Error DB Pesanan Baru:", error.message);
    return NextResponse.json({ error: 'Gagal cek pesanan' }, { status: 500 });
  }
}