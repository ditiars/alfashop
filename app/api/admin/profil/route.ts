import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID User tidak diberikan' }, { status: 400 });

    const users: any = await query('SELECT id, name, email, whatsapp, role FROM users WHERE id = ?', [id]);

    if (users.length === 0) return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });

    return NextResponse.json(users[0], { status: 200 });
  } catch (error: any) {
    console.error("Error Get Admin Profil:", error);
    return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, email, whatsapp, password } = await request.json();

    if (!id) return NextResponse.json({ error: 'ID Admin tidak ditemukan' }, { status: 400 });

    // Cek apakah email sudah dipakai oleh user lain
    if (email) {
      const emailCheck: any = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
      }
    }

    if (password && password.trim() !== '') {
      const hashedPassword = bcrypt.hashSync(password, 10);
      await query('UPDATE users SET name = ?, email = ?, whatsapp = ?, password = ? WHERE id = ?', [name, email, whatsapp, hashedPassword, id]);
    } else {
      await query('UPDATE users SET name = ?, email = ?, whatsapp = ? WHERE id = ?', [name, email, whatsapp, id]);
    }

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' }, { status: 200 });
  } catch (error: any) {
    console.error("Error Update Admin Profil:", error);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
