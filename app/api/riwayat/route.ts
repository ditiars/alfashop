import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wa = searchParams.get('wa');

  try {
    let sql = 'SELECT * FROM pesanan';
    let values: any[] = [];

    // Jika ada input WA, kita filter datanya
    if (wa) {
      sql += ' WHERE whatsapp LIKE ?';
      values = [`%${wa}%`];
    }

    // KUNCI SUKSES: Ganti tgl_order menjadi id. 
    // Mengurutkan dari ID terbesar otomatis menampilkan pesanan paling baru!
    sql += ' ORDER BY id DESC';

    const orders: any = await query(sql, values);

    // Ambil detail pesanan (produk apa saja yang dibeli) untuk masing-masing pesanan
    for (const order of orders) {
      const items = await query(
        `SELECT 
          dp.jumlah AS qty, 
          dp.subtotal, 
          p.id, 
          p.nama_produk, 
          p.gambar_url, 
          p.harga, 
          p.stok,
          p.kategori
         FROM detail_pesanan dp 
         LEFT JOIN produk p ON dp.produk_id = p.id 
         WHERE dp.pesanan_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return NextResponse.json(orders);
    
  } catch (error: any) {
    // Biar kalau error lagi, satpam MySQL-nya laporan langsung ke terminal VS Code
    console.error("🔥 BONGKAR ERROR API RIWAYAT:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}