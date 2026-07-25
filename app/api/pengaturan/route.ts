import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Sesuaikan path MySQL kamu

export async function GET() {
  try {
    // Mengambil status toko dari tabel pengaturan (id = 1)
    const pengaturan: any = await query('SELECT is_open FROM pengaturan WHERE id = 1');
    
    // Default anggap toko buka (true) jika tabel masih kosong
    const isOpen = pengaturan.length > 0 ? Boolean(pengaturan[0].is_open) : true;

    return NextResponse.json({ isOpen });
  } catch (error: any) {
    console.error("Error cek status toko:", error.message);
    // Jika database error, asumsikan toko tutup demi keamanan
    return NextResponse.json({ isOpen: false });
  }
}