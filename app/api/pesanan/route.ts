import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pesananData: any = await query('SELECT * FROM pesanan ORDER BY created_at DESC');
    const detailData: any = await query(`
      SELECT dp.pesanan_id, dp.jumlah as quantity, p.nama_produk as name, p.harga as price 
      FROM detail_pesanan dp
      JOIN produk p ON dp.produk_id = p.id
    `);

    const result = pesananData.map((order: any) => ({
      ...order,
      item_pesanan: detailData.filter((detail: any) => detail.pesanan_id === order.id)
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal ambil data' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    // 1. Update status di MySQL
    await query('UPDATE pesanan SET status = ? WHERE id = ?', [status, id]);

    // 2. 🔥 INTEGRASI FONNTE: Kirim notif perubahan status ke pelanggan
    const dataOrder: any = await query('SELECT nama_pelanggan, whatsapp FROM pesanan WHERE id = ?', [id]);
    
    if (dataOrder.length > 0) {
      const { nama_pelanggan, whatsapp } = dataOrder[0];
      const orderIdFormatted = `#ORD-${id.toString().padStart(4, '0')}`;
      
      let pesanWA = "";
      if (status === "Diproses") {
        pesanWA = `Halo *${nama_pelanggan}*! 👋\n\nPesanan Anda *${orderIdFormatted}* sekarang berstatus: *SEDANG DIPROSES*. Admin kami sedang menyiapkan barang Anda. Mohon ditunggu ya! 😊`;
      } else if (status === "Selesai") {
        pesanWA = `Hore! *${nama_pelanggan}*! 🎉\n\nPesanan Anda *${orderIdFormatted}* telah *SELESAI* dan siap dikirim/diambil. Terima kasih sudah belanja di AlfaShop! 🙏`;
      }

      if (pesanWA !== "" && whatsapp !== "-") {
        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { "Authorization": process.env.FONNTE_TOKEN || "kPHFcZPkCqYqkF93hW1n" },
          body: new URLSearchParams({ target: whatsapp, message: pesanWA, countryCode: "62" }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 });
  }
}