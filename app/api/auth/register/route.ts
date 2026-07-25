import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, password } = body;

    // Cek apakah email sudah terdaftar
    const existing: any = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar!' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Simpan user baru (Password sebaiknya di-hash, tapi ini versi dasarnya)
    await query(
      'INSERT INTO users (name, email, whatsapp, password) VALUES (?, ?, ?, ?)',
      [name, email, whatsapp, hashedPassword]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}