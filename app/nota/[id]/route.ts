import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // 1. Ambil data utama pesanan
    const pesanan: any = await query('SELECT * FROM pesanan WHERE id = ?', [id]);
    
    // 2. Ambil detail barang di pesanan tersebut
    const items: any = await query(`
      SELECT dp.*, p.nama_produk 
      FROM detail_pesanan dp 
      JOIN produk p ON dp.produk_id = p.id 
      WHERE dp.pesanan_id = ?`, [id]);

    if (pesanan.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...pesanan[0],
      items: items
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data nota' }, { status: 500 });
  }
}