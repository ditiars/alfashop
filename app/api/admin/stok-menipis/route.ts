import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; 

export async function GET() {
  try {
    const batasStok = 5;
    const produkMenipis: any = await query(
      'SELECT id, nama_produk, stok FROM produk WHERE stok <= ? AND is_bundle = 0 ORDER BY stok ASC',
      [batasStok]
    );
    
    return NextResponse.json(produkMenipis || [], { status: 200 });
  } catch (error: any) {
    console.error("Error DB Stok Menipis:", error.message);
    return NextResponse.json({ error: 'Gagal cek stok' }, { status: 500 });
  }
}
