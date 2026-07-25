import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { total_harga, items } = body; 

    // 1. Simpan ke tabel pesanan utama
    // Kita isi nilai default karena ini kasir offline (tanpa kurir & WA)
    const resultOrder: any = await query(
      `INSERT INTO pesanan (nama_pelanggan, whatsapp, alamat, total_harga, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Pembeli Offline (Kasir)', '-', 'Toko AlfaShop', total_harga, 'Selesai']
    );

    const orderId = resultOrder.insertId;

    // 2. Looping memproses setiap barang di keranjang
    for (const item of items) {
      const subtotalItem = item.qty * item.harga; 

      // a. Simpan ke tabel detail_pesanan untuk riwayat belanja
      await query(
        'INSERT INTO detail_pesanan (pesanan_id, produk_id, jumlah, subtotal) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.qty, subtotalItem]
      );

      // b. 🔥 PENGURANGAN STOK OTOMATIS
      await query(
        'UPDATE produk SET stok = stok - ? WHERE id = ?',
        [item.qty, item.id]
      );

      // c. 🔥 FITUR AUTO-KOSONG (Matikan toggle jika stok habis)
      await query(
        'UPDATE produk SET tersedia = 0 WHERE id = ? AND stok <= 0',
        [item.id]
      );
    }

    // 🔥 BAGIAN YANG DIPERBAIKI: Tambahkan pesanan_id agar Frontend bisa buka nota!
    return NextResponse.json({ 
      success: true, 
      message: 'Transaksi berhasil & Stok otomatis dikurangi',
      pesanan_id: orderId 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("🔥 ERROR API KASIR:", error.message);
    return NextResponse.json({ error: 'Gagal memproses transaksi kasir.' }, { status: 500 });
  }
}