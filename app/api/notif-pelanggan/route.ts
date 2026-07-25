import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomorWA, namaPelanggan, total } = body;

    const pesan = `Halo *${namaPelanggan}*! 👋\n\nKabar gembira! Pesanan Anda di *AlfaShop* sebesar *Rp ${total.toLocaleString('id-ID')}* saat ini sedang diantar oleh tim kami ke alamat Anda.\n\nMohon ditunggu ya. Terima kasih sudah belanja di AlfaShop! 🛒✨`;

    // Kirim ke WhatsApp Gateway (Misal: Fonnte)
    console.log(`MENGIRIM WA KONFIRMASI KE PELANGGAN (${nomorWA}):`, pesan);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}