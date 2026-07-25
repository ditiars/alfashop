import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET: Ambil semua pengaturan toko
export async function GET() {
  try {
    const rows: any = await query('SELECT * FROM pengaturan WHERE id = 1');
    if (rows.length === 0) {
      return NextResponse.json({
        is_open: 1,
        ongkir: 0,
        no_rekening: '',
        nama_bank: '',
        whatsapp_admin: '',
        nama_toko: 'AlfaShop',
        alamat_toko: '',
      });
    }
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update pengaturan toko
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ongkir, no_rekening, nama_bank, whatsapp_admin, nama_toko, alamat_toko } = body;

    await query(
      `UPDATE pengaturan 
       SET ongkir=?, no_rekening=?, nama_bank=?, whatsapp_admin=?, nama_toko=?, alamat_toko=? 
       WHERE id = 1`,
      [
        ongkir ?? 0,
        no_rekening || null,
        nama_bank || null,
        whatsapp_admin || null,
        nama_toko || 'AlfaShop',
        alamat_toko || null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
