import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET: Ambil semua kupon (dengan alias kolom agar frontend tidak perlu berubah)
export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        id,
        kode_kupon   AS kode,
        tipe_diskon  AS jenis,
        nilai_diskon AS nilai,
        min_belanja,
        max_diskon,
        kuota,
        digunakan,
        aktif,
        berlaku_sampai,
        created_at,
        produk_id
      FROM kupon 
      ORDER BY created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Buat kupon baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kode, jenis, nilai, min_belanja, max_diskon, kuota, berlaku_sampai, produk_id } = body;

    if (jenis === 'persen' && !kode) {
      return NextResponse.json({ error: 'Kode kupon wajib diisi untuk diskon persentase' }, { status: 400 });
    }
    if (jenis === 'nominal' && !produk_id) {
      return NextResponse.json({ error: 'Produk wajib dipilih untuk promo produk' }, { status: 400 });
    }
    if (!nilai) {
      return NextResponse.json({ error: 'Nilai diskon wajib diisi' }, { status: 400 });
    }

    await query(
      `INSERT INTO kupon (kode_kupon, tipe_diskon, nilai_diskon, min_belanja, max_diskon, kuota, berlaku_sampai, produk_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode ? kode.toUpperCase() : null,
        jenis || 'persen',
        nilai,
        min_belanja || 0,
        max_diskon || null,
        kuota || null,
        berlaku_sampai || null,
        produk_id || null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Kode kupon sudah digunakan!' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update kupon
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, kode, jenis, nilai, min_belanja, max_diskon, kuota, berlaku_sampai, aktif, produk_id } = body;

    if (!id) return NextResponse.json({ error: 'ID wajib ada' }, { status: 400 });

    await query(
      `UPDATE kupon 
       SET kode_kupon=?, tipe_diskon=?, nilai_diskon=?, min_belanja=?, max_diskon=?, 
           kuota=?, berlaku_sampai=?, aktif=?, produk_id=? 
       WHERE id=?`,
      [
        kode ? kode.toUpperCase() : null,
        jenis,
        nilai,
        min_belanja || 0,
        max_diskon || null,
        kuota || null,
        berlaku_sampai || null,
        aktif ? 1 : 0,
        produk_id || null,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus kupon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID wajib ada' }, { status: 400 });

    await query('DELETE FROM kupon WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
