import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // TAMBAHKAN 'role' DI SINI
    const user: any = await query(
      'SELECT id, name, email, whatsapp, role, password FROM users WHERE email = ?',
      [email]
    );

    if (user.length === 0) {
      return NextResponse.json({ error: 'Email atau Password salah!' }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user[0].password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau Password salah!' }, { status: 401 });
    }

    // Hilangkan password sebelum return
    delete user[0].password;

    return NextResponse.json({ success: true, user: user[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}