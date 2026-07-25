import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// POST: Validasi kode kupon dan hitung nominal diskon
export async function POST(request: Request) {
  try {
    const { kode, subtotal } = await request.json();

    if (!kode) {
      return NextResponse.json({ valid: false, pesan: 'Kode kupon tidak boleh kosong.' }, { status: 400 });
    }

    // Cari kupon di database (gunakan alias agar nama kolom seragam)
    const rows: any = await query(
      `SELECT 
         id,
         kode_kupon   AS kode,
         tipe_diskon  AS jenis,
         nilai_diskon AS nilai,
         min_belanja,
         max_diskon,
         kuota,
         digunakan,
         aktif,
         berlaku_sampai
       FROM kupon 
       WHERE kode_kupon = ? AND aktif = 1 
       LIMIT 1`,
      [kode.toUpperCase().trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, pesan: 'Kode kupon tidak ditemukan atau sudah tidak aktif.' });
    }

    const v = rows[0];

    // Cek tanggal kadaluarsa
    if (v.berlaku_sampai && new Date(v.berlaku_sampai) < new Date()) {
      return NextResponse.json({ valid: false, pesan: `Kupon "${kode.toUpperCase()}" sudah kedaluwarsa.` });
    }

    // Cek kuota
    if (v.kuota !== null && v.digunakan >= v.kuota) {
      return NextResponse.json({ valid: false, pesan: `Kupon "${kode.toUpperCase()}" sudah habis kuotanya.` });
    }

    // Cek minimum belanja
    if (v.min_belanja && subtotal < v.min_belanja) {
      return NextResponse.json({
        valid: false,
        pesan: `Minimum belanja untuk kupon ini adalah Rp ${Number(v.min_belanja).toLocaleString('id-ID')}.`
      });
    }

    // Hitung nominal diskon
    let potongan = 0;
    if (v.jenis === 'persen') {
      potongan = Math.floor((subtotal * v.nilai) / 100);
      if (v.max_diskon && potongan > v.max_diskon) {
        potongan = v.max_diskon;
      }
    } else {
      potongan = v.nilai;
    }

    // Potongan tidak boleh melebihi subtotal
    potongan = Math.min(potongan, subtotal);

    return NextResponse.json({
      valid: true,
      potongan,
      kode: v.kode,
      jenis: v.jenis,
      nilai: v.nilai,
      pesan: `Kupon berhasil! Hemat Rp ${potongan.toLocaleString('id-ID')} 🎉`
    });

  } catch (error: any) {
    console.error('Error API Cek Kupon:', error.message);
    return NextResponse.json({ valid: false, pesan: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
