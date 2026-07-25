import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

// 🔥 TAMBAHAN BARU: Fungsi GET untuk mengambil data profil
export async function GET(request: Request) {
  try {
    // Ambil ID dari URL (misal: /api/profil?id=1)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID User tidak diberikan' }, { status: 400 });
    }

    // Cari data user di database (pelanggan)
    const pelanggan: any = await query('SELECT id, nama_pelanggan AS nama, no_wa AS whatsapp, alamat FROM pelanggan WHERE id = ?', [id]);

    if (pelanggan.length === 0) {
      // Jika belum ada di tabel pelanggan (karena baru register), ambil dari tabel users
      const users: any = await query('SELECT id, name AS nama, whatsapp, "" AS alamat FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(users[0], { status: 200 });
    }

    return NextResponse.json(pelanggan[0], { status: 200 });
  } catch (error: any) {
    console.error("Error Get Profil:", error.message);
    return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 });
  }
}

// (Fungsi PATCH yang kemarin biarkan tetap ada di bawah sini...)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, whatsapp, alamat } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID User tidak ditemukan' }, { status: 400 });
    }

    // Update data ke tabel pelanggan
    const updateResult: any = await query('UPDATE pelanggan SET nama_pelanggan = ?, no_wa = ?, alamat = ? WHERE id = ?', [nama, whatsapp, alamat, id]);
    
    // Jika belum ada di tabel pelanggan (misal baru register), maka insert
    if (updateResult.affectedRows === 0) {
      await query('INSERT INTO pelanggan (id, nama_pelanggan, no_wa, alamat) VALUES (?, ?, ?, ?)', [id, nama, whatsapp, alamat]);
    }

    // Update juga tabel users agar sinkron
    await query('UPDATE users SET name = ?, whatsapp = ? WHERE id = ?', [nama, whatsapp, id]);

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error Update Profil:", error.message);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}