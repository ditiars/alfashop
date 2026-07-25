import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request: Request) {
  try {
    const { pesananId, wa } = await request.json();

    if (!pesananId || !wa) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Verifikasi pesanan milik pengguna tersebut dan statusnya Menunggu
    const orders: any = await query('SELECT id, status FROM pesanan WHERE id = ? AND whatsapp = ?', [pesananId, wa]);
    
    if (orders.length === 0) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan atau Anda tidak berhak membatalkannya' }, { status: 404 });
    }

    if (orders[0].status !== 'Menunggu') {
      return NextResponse.json({ success: false, message: 'Hanya pesanan berstatus Menunggu yang dapat dibatalkan' }, { status: 400 });
    }

    // 2. Ubah status menjadi Dibatalkan
    await query('UPDATE pesanan SET status = ? WHERE id = ?', ['Dibatalkan', pesananId]);

    // 3. Kembalikan stok produk
    const items: any = await query('SELECT produk_id, jumlah FROM detail_pesanan WHERE pesanan_id = ?', [pesananId]);
    for (const item of items) {
      await query('UPDATE produk SET stok = stok + ?, tersedia = 1 WHERE id = ?', [item.jumlah, item.produk_id]);
    }

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dibatalkan dan stok dikembalikan' });

  } catch (error: any) {
    console.error("Gagal batalkan pesanan:", error);
    return NextResponse.json({ success: false, message: 'Gagal membatalkan pesanan', error: error.message }, { status: 500 });
  }
}
