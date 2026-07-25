import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET: Ambil semua banner
export async function GET() {
  try {
    const rows = await query('SELECT * FROM banner ORDER BY urutan ASC, created_at DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tambah banner baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { judul, gambar_url, link_url, urutan } = body;

    if (!gambar_url) {
      return NextResponse.json({ error: 'Gambar wajib diisi' }, { status: 400 });
    }

    const result: any = await query(
      'INSERT INTO banner (judul, gambar_url, link_url, urutan) VALUES (?, ?, ?, ?)',
      [judul || null, gambar_url, link_url || null, urutan || 0]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update banner (urutan, status aktif, atau data lain)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, judul, gambar_url, link_url, urutan, aktif } = body;

    if (!id) return NextResponse.json({ error: 'ID wajib ada' }, { status: 400 });

    await query(
      'UPDATE banner SET judul=?, gambar_url=?, link_url=?, urutan=?, aktif=? WHERE id=?',
      [judul || null, gambar_url, link_url || null, urutan ?? 0, aktif ? 1 : 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus banner
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID wajib ada' }, { status: 400 });

    await query('DELETE FROM banner WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
