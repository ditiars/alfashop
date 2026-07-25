import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Buat koneksi ke database MySQL kamu
const dbConfig = {
  host: 'localhost',
  user: 'root', // Default XAMPP biasanya root
  password: '', // Kosongkan jika XAMPP kamu tidak dipassword
  database: 'alfashop', // Nama database yang tadi kita buat
};

// 1. Fungsi GET: Untuk membaca status toko (Dipakai oleh halaman Pelanggan)
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows]: any = await connection.execute('SELECT is_open FROM pengaturan WHERE id = 1');
    await connection.end();

    // Mengembalikan nilai 1 (true) atau 0 (false)
    return NextResponse.json({ is_open: rows[0].is_open === 1 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal membaca status toko' }, { status: 500 });
  }
}

// 2. Fungsi PUT: Untuk mengubah status toko (Dipakai oleh tombol saklar Admin)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { is_open } = body; 

    // Konversi boolean (true/false) jadi angka 1 atau 0 untuk MySQL
    const dbValue = is_open ? 1 : 0; 

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('UPDATE pengaturan SET is_open = ? WHERE id = 1', [dbValue]);
    await connection.end();

    return NextResponse.json({ message: 'Status toko berhasil diubah!', is_open });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengubah status toko' }, { status: 500 });
  }
}