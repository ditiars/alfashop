import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Sesuaikan path MySQL kamu

export async function GET() {
  try {
    // Mengambil status toko dan ongkir dari tabel pengaturan (id = 1)
    const pengaturan: any = await query('SELECT is_open, ongkir FROM pengaturan WHERE id = 1');
    
    // Default anggap toko buka (true) dan ongkir 0 jika tabel masih kosong
    const isOpen = pengaturan.length > 0 ? Boolean(pengaturan[0].is_open) : true;
    const ongkir = pengaturan.length > 0 ? Number(pengaturan[0].ongkir) : 0;

    return NextResponse.json({ isOpen, ongkir });
  } catch (error: any) {
    console.error("Error cek status toko:", error.message);
    // Jika database error, asumsikan toko tutup demi keamanan dan ongkir 0
    return NextResponse.json({ isOpen: false, ongkir: 0 });
  }
}