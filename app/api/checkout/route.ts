import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fullName, whatsapp, address, ongkir = 0, items, kode_voucher, potongan_harga = 0 } = body;

    // VERIFIKASI WA DENGAN DATABASE
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Silakan login terlebih dahulu untuk memesan' }, { status: 401 });
    }
    
    const userDb: any = await query('SELECT whatsapp FROM users WHERE id = ? LIMIT 1', [userId]);
    if (userDb.length === 0) {
      return NextResponse.json({ success: false, message: 'Akun pelanggan tidak ditemukan di database' }, { status: 401 });
    }
    if (userDb[0].whatsapp !== whatsapp) {
      return NextResponse.json({ success: false, message: 'Keamanan: Nomor WhatsApp harus sama dengan yang terdaftar di profil Anda!' }, { status: 403 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Keranjang kosong' }, { status: 400 });
    }

    // 1. Validasi Stok & Hitung Harga Aktual dari Database
    let subtotalAktual = 0;
    const validatedItems = [];

    for (const item of items) {
      const dbProduct: any = await query(`
        SELECT p.id, p.nama_produk, p.harga, p.stok, p.is_bundle, k.nilai_diskon AS promo_nominal 
        FROM produk p
        LEFT JOIN kupon k 
          ON k.produk_id = p.id 
          AND k.aktif = 1 
          AND k.tipe_diskon = 'nominal' 
          AND (k.berlaku_sampai IS NULL OR k.berlaku_sampai >= NOW())
          AND (k.kuota IS NULL OR k.digunakan < k.kuota)
        WHERE p.id = ? LIMIT 1
      `, [item.id]);
      
      if (!dbProduct || dbProduct.length === 0) {
        return NextResponse.json({ success: false, message: `Produk dengan ID ${item.id} tidak ditemukan.` }, { status: 400 });
      }

      const produkAsli = dbProduct[0];
      const isPromo = !!produkAsli.promo_nominal;
      const hargaAktual = isPromo ? Math.max(0, produkAsli.harga - produkAsli.promo_nominal) : produkAsli.harga;

      const is_bundle = produkAsli.is_bundle === 1;
      let bundleComponents = [];

      if (is_bundle) {
        // Cek stok setiap item penyusun bundle
        const dbBundles: any = await query(`
          SELECT db.produk_id, db.jumlah, p.stok, p.nama_produk 
          FROM detail_bundling db 
          JOIN produk p ON p.id = db.produk_id 
          WHERE db.bundle_id = ?
        `, [produkAsli.id]);
        
        for (const sub of dbBundles) {
          const requiredStock = sub.jumlah * item.qty;
          if (sub.stok < requiredStock) {
            return NextResponse.json({ success: false, message: `Maaf, stok ${sub.nama_produk} (isi dari paket ${produkAsli.nama_produk}) tidak mencukupi. Sisa: ${sub.stok}` }, { status: 400 });
          }
        }
        bundleComponents = dbBundles;
      } else {
        if (produkAsli.stok < item.qty) {
          return NextResponse.json({ success: false, message: `Maaf, stok ${produkAsli.nama_produk} tidak mencukupi. Sisa stok: ${produkAsli.stok}` }, { status: 400 });
        }
      }

      const subtotalItem = item.qty * hargaAktual;
      subtotalAktual += subtotalItem;

      validatedItems.push({
        id: produkAsli.id,
        qty: item.qty,
        harga: hargaAktual,
        subtotal: subtotalItem,
        is_bundle,
        bundleComponents
      });
    }

    // 2. Validasi ulang voucher di backend
    let potonganFinal = 0;
    let kodeVoucherFinal: string | null = null;

    if (kode_voucher && kode_voucher.trim() !== '') {
      const vRows: any = await query(
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
        [kode_voucher.toUpperCase().trim()]
      );

      if (vRows.length > 0) {
        const v = vRows[0];
        const masihValid =
          (!v.berlaku_sampai || new Date(v.berlaku_sampai) >= new Date()) &&
          (v.kuota === null || v.digunakan < v.kuota) &&
          subtotalAktual >= v.min_belanja;

        if (masihValid) {
          if (v.jenis === 'persen') {
            potonganFinal = Math.floor((subtotalAktual * v.nilai) / 100);
            if (v.max_diskon && potonganFinal > v.max_diskon) potonganFinal = v.max_diskon;
          } else {
            potonganFinal = v.nilai;
          }
          potonganFinal = Math.min(potonganFinal, subtotalAktual);
          kodeVoucherFinal = v.kode;
        }
      }
    }

    // 3. Hitung total akhir
    const totalHargaAktual = subtotalAktual + Number(ongkir) - potonganFinal;

    // 4. Simpan pesanan ke MySQL
    const pesananResult: any = await query(
      `INSERT INTO pesanan 
        (nama_pelanggan, whatsapp, alamat, total_harga, kode_voucher, potongan_harga, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, whatsapp, address, totalHargaAktual, kodeVoucherFinal, potonganFinal, 'Menunggu']
    );
    const pesanan_id = pesananResult.insertId;

    // 5. Masukkan detail barang & Update Stok
    for (const vItem of validatedItems) {
      await query(
        'INSERT INTO detail_pesanan (pesanan_id, produk_id, jumlah, subtotal) VALUES (?, ?, ?, ?)',
        [pesanan_id, vItem.id, vItem.qty, vItem.subtotal]
      );
      
      if (vItem.is_bundle) {
        // Potong stok semua barang yang ada di dalam bundle
        for (const sub of vItem.bundleComponents) {
          const qtyPotong = sub.jumlah * vItem.qty;
          await query('UPDATE produk SET stok = stok - ? WHERE id = ?', [qtyPotong, sub.produk_id]);
          await query('UPDATE produk SET tersedia = 0 WHERE id = ? AND stok <= 0', [sub.produk_id]);
        }
      } else {
        // Potong stok barang reguler
        await query('UPDATE produk SET stok = stok - ? WHERE id = ?', [vItem.qty, vItem.id]);
        await query('UPDATE produk SET tersedia = 0 WHERE id = ? AND stok <= 0', [vItem.id]);
      }
    }

    // 6. Increment counter pemakaian voucher
    if (kodeVoucherFinal) {
      await query('UPDATE kupon SET digunakan = digunakan + 1 WHERE kode_kupon = ?', [kodeVoucherFinal]);
    }

    // 7. Bangun pesan WA
    const diskonInfo = potonganFinal > 0
      ? `\n🏷️ Voucher: *${kodeVoucherFinal}* (Hemat Rp ${potonganFinal.toLocaleString('id-ID')})`
      : '';

    const pesanWA = `Halo *${fullName}*! 👋\n\nTerima kasih sudah memesan di *AlfaShop*.\n\n*Detail Pesanan Anda:*\n🆔 Nomor Order: *#ORD-${pesanan_id.toString().padStart(4, '0')}*\n🛒 Subtotal: Rp ${subtotalAktual.toLocaleString('id-ID')}\n🚚 Ongkir: Rp ${Number(ongkir).toLocaleString('id-ID')}${diskonInfo}\n💳 Total Bayar: *Rp ${totalHargaAktual.toLocaleString('id-ID')}*\n📍 Alamat: ${address}\n\nPesanan Anda berstatus *Menunggu*. Admin kami akan segera memprosesnya.`;

    // 8. Kirim notifikasi WA via Fonnte
    try {
      const fonnteRes = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": process.env.FONNTE_TOKEN || "kPHFcZPkCqYqkF93hW1n",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          target: whatsapp,
          message: pesanWA,
          countryCode: "62",
          delay: "2",
        }),
      });

      const fonnteData = await fonnteRes.json();
      console.log("=== CEK FONNTE ===");
      console.log("Status Balasan:", fonnteData);
    } catch (fonnteError) {
      console.error("🔥 Error Koneksi Fonnte:", fonnteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      pesanan_id,
      total: totalHargaAktual,
      potongan: potonganFinal
    });
    
  } catch (error: any) {
    console.error("Error saat Checkout:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}