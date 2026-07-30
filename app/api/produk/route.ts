import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Pastikan path ini sesuai dengan koneksi MySQL kamu

export const dynamic = 'force-dynamic'; // Mencegah cache agresif Next.js

// 1. GET: Ambil daftar semua produk
export async function GET(request: Request) {
  try {
    const produk: any = await query(`
      SELECT p.*, k.nilai_diskon AS promo_nominal 
      FROM produk p 
      LEFT JOIN kupon k 
        ON k.produk_id = p.id 
        AND k.aktif = 1 
        AND k.tipe_diskon = 'nominal' 
        AND (k.berlaku_sampai IS NULL OR k.berlaku_sampai >= NOW())
        AND (k.kuota IS NULL OR k.digunakan < k.kuota)
      ORDER BY p.id DESC
    `);
    
    // Ambil semua detail variasi
    const variasi: any = await query(`
      SELECT * FROM variasi_produk
    `);
    
    // Ambil semua detail bundling jika ada produk bundle
    const bundles: any = await query(`
      SELECT db.*, p.nama_produk, p.stok as stok_satuan, p.harga as harga_satuan
      FROM detail_bundling db
      JOIN produk p ON p.id = db.produk_id
    `);

    // Karena MySQL kadang mengembalikan TINYINT (0/1) untuk boolean, kita pastikan formatnya true/false untuk frontend
    const formattedProduk = produk.map((p: any) => {
      const isPromo = !!p.promo_nominal;
      const hargaAsli = p.harga;
      const hargaDiskon = isPromo ? Math.max(0, hargaAsli - p.promo_nominal) : hargaAsli;
      
      const produkVariasi = variasi.filter((v: any) => v.produk_id === p.id);
      const is_bundle = p.is_bundle === 1 || p.is_bundle === true;
      let bundleItems = [];
      let calculatedStock = p.stok;

      if (is_bundle) {
        bundleItems = bundles
          .filter((b: any) => b.bundle_id === p.id)
          .map((b: any) => ({
            produk_id: b.produk_id,
            nama_produk: b.nama_produk,
            jumlah: b.jumlah,
            stok_satuan: b.stok_satuan,
            harga_satuan: b.harga_satuan
          }));

        if (bundleItems.length > 0) {
          calculatedStock = Math.min(...bundleItems.map((b: any) => Math.floor(b.stok_satuan / b.jumlah)));
        } else {
          calculatedStock = 0;
        }
      }

      return {
        ...p,
        stok: calculatedStock,
        tersedia: p.tersedia === 1 || p.tersedia === true,
        is_bundle,
        bundle_items: bundleItems,
        variasi: produkVariasi,
        harga_asli: hargaAsli,
        harga: hargaDiskon,
        is_promo: isPromo
      };
    });

    return NextResponse.json(formattedProduk);
  } catch (error: any) {
    console.error("🔥 Error GET Produk:", error.message);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

// 2. POST: Tambah produk baru
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nama_produk, kategori, harga, satuan, stok, gambar_url, deskripsi, tersedia, is_bundle, bundle_items, variasi } = data;

    // MySQL menggunakan 1 untuk true, 0 untuk false
    const statusTersedia = tersedia ? 1 : 0;
    const isBundleDb = is_bundle ? 1 : 0;
    let nilaiStok = parseInt(stok) || 0; // Pastikan stok berformat angka

    const result: any = await query(
      `INSERT INTO produk (nama_produk, kategori, harga, satuan, stok, gambar_url, deskripsi, tersedia, is_bundle) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_produk, kategori, harga, satuan, nilaiStok, gambar_url, deskripsi, statusTersedia, isBundleDb]
    );
    const newId = result.insertId;

    if (is_bundle && bundle_items && bundle_items.length > 0) {
      for (const item of bundle_items) {
        await query(
          'INSERT INTO detail_bundling (bundle_id, produk_id, jumlah) VALUES (?, ?, ?)',
          [newId, item.produk_id, item.jumlah]
        );
      }
    }
    
    if (variasi && variasi.length > 0) {
      for (const v of variasi) {
        await query(
          'INSERT INTO variasi_produk (produk_id, nama_variasi, harga, stok, harga_grosir, min_grosir) VALUES (?, ?, ?, ?, ?, ?)',
          [newId, v.nama_variasi, v.harga, v.stok || 0, v.harga_grosir || null, v.min_grosir || null]
        );
      }
    }

    // Ambil kembali data yang baru di-insert untuk dikembalikan ke frontend
    const newProduct: any = await query('SELECT * FROM produk WHERE id = ?', [newId]);
    
    let dbBundleItems: any[] = [];
    if (is_bundle) {
      dbBundleItems = (await query(`
        SELECT db.*, p.nama_produk, p.stok as stok_satuan, p.harga as harga_satuan 
        FROM detail_bundling db 
        JOIN produk p ON p.id = db.produk_id 
        WHERE db.bundle_id = ?
      `, [newId])) as any[];
    }

    const responseData = {
      ...newProduct[0],
      tersedia: newProduct[0].tersedia === 1,
      is_bundle: newProduct[0].is_bundle === 1,
      bundle_items: dbBundleItems
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("🔥 Error POST Produk:", error.message);
    return NextResponse.json({ error: 'Gagal menyimpan produk baru' }, { status: 500 });
  }
}

// 3. PUT: Update produk (Bisa untuk Edit Detail ATAU Toggle Aktif/Kosong)
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, nama_produk, kategori, harga, satuan, stok, gambar_url, deskripsi, tersedia, is_bundle, bundle_items, variasi } = data;

    if (!id) return NextResponse.json({ error: 'ID produk wajib ada' }, { status: 400 });

    const statusTersedia = tersedia ? 1 : 0;
    const isBundleDb = is_bundle ? 1 : 0;
    const nilaiStok = parseInt(stok) || 0; // Pastikan stok berformat angka

    await query(
      `UPDATE produk SET 
       nama_produk = ?, kategori = ?, harga = ?, satuan = ?, stok = ?, gambar_url = ?, deskripsi = ?, tersedia = ?, is_bundle = ? 
       WHERE id = ?`,
      [nama_produk, kategori, harga, satuan, nilaiStok, gambar_url, deskripsi, statusTersedia, isBundleDb, id]
    );

    if (is_bundle) {
      // Hapus yang lama, insert yang baru
      await query('DELETE FROM detail_bundling WHERE bundle_id = ?', [id]);
      if (bundle_items && bundle_items.length > 0) {
        for (const item of bundle_items) {
          await query(
            'INSERT INTO detail_bundling (bundle_id, produk_id, jumlah) VALUES (?, ?, ?)',
            [id, item.produk_id, item.jumlah]
          );
        }
      }
    }
    
    // Hapus variasi lama dan insert variasi baru
    await query('DELETE FROM variasi_produk WHERE produk_id = ?', [id]);
    if (variasi && variasi.length > 0) {
      for (const v of variasi) {
        await query(
          'INSERT INTO variasi_produk (produk_id, nama_variasi, harga, stok, harga_grosir, min_grosir) VALUES (?, ?, ?, ?, ?, ?)',
          [id, v.nama_variasi, v.harga, v.stok || 0, v.harga_grosir || null, v.min_grosir || null]
        );
      }
    }

    // Ambil data yang sudah di-update
    const updatedProduct: any = await query('SELECT * FROM produk WHERE id = ?', [id]);
    
    let dbBundleItems: any = [];
    if (is_bundle) {
      dbBundleItems = await query(`
        SELECT db.*, p.nama_produk, p.stok as stok_satuan, p.harga as harga_satuan 
        FROM detail_bundling db 
        JOIN produk p ON p.id = db.produk_id 
        WHERE db.bundle_id = ?
      `, [id]);
    }

    const responseData = {
      ...updatedProduct[0],
      tersedia: updatedProduct[0].tersedia === 1,
      is_bundle: updatedProduct[0].is_bundle === 1,
      bundle_items: dbBundleItems
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("🔥 Error PUT Produk:", error.message);
    return NextResponse.json({ error: 'Gagal mengupdate produk' }, { status: 500 });
  }
}

// 4. DELETE: Hapus produk dari database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID produk tidak ditemukan' }, { status: 400 });

    await query('DELETE FROM produk WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error: any) {
    console.error("🔥 Error DELETE Produk:", error.message);
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}