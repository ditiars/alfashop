const mysql = require('mysql2/promise');

async function importData() {
  const connection = await mysql.createConnection({
    uri: "mysql://22TXjSMZLDGSdFk.root:AqrO11g5N7DWPkR4@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test",
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    multipleStatements: true
  });

  try {
    console.log("Disabling foreign key checks...");
    await connection.query('SET FOREIGN_KEY_CHECKS=0;');

    console.log("Truncating tables...");
    await connection.query('TRUNCATE TABLE banner;');
    await connection.query('TRUNCATE TABLE kupon;');
    await connection.query('TRUNCATE TABLE pelanggan;');
    await connection.query('TRUNCATE TABLE pengaturan;');
    await connection.query('TRUNCATE TABLE detail_pesanan;');
    await connection.query('TRUNCATE TABLE pesanan;');
    
    // We don't truncate `produk` completely if it causes issues, but we can truncate it.
    await connection.query('TRUNCATE TABLE produk;');
    
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('TRUNCATE TABLE voucher;');

    console.log("Inserting new data...");

    await connection.query(`
      INSERT INTO banner (id, gambar_url, aktif, created_at, judul, link_url, urutan) VALUES
      (2, 'https://res.cloudinary.com/bvwttel5/image/upload/v1784785830/alfashop/banners/hxzuua3h1nundby2unzv.jpg', 1, '2026-06-03 17:03:18', 'mumpung lagi ada promo niih!!!', NULL, 1);
    `);

    await connection.query(`
      INSERT INTO kupon (id, kode_kupon, tipe_diskon, nilai_diskon, kuota, berlaku_sampai, created_at, aktif, min_belanja, max_diskon, digunakan, produk_id) VALUES
      (1, 'ALFA432', 'persen', 5, 8, '2026-06-20 10:00:00', '2026-06-03 17:08:28', 0, 50000, 130000, 0, NULL),
      (2, NULL, 'nominal', 501, NULL, '2026-06-19 10:00:00', '2026-06-03 17:26:39', 0, 0, NULL, 0, 4);
    `);

    await connection.query(`
      INSERT INTO pelanggan (id, nama_pelanggan, no_wa, alamat) VALUES
      (1, 'Aska Dafian Ramadhani', '08132913732', 'jalan pasewaran, desa watukebo, kec wongsorejo, kab banyuwangi. keselatan rumah kepala desa'),
      (2, 'Aska Dafia Ramadhani', '62 813-2913-732', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter');
    `);

    await connection.query(`
      INSERT INTO pengaturan (id, is_open, updated_at, ongkir_standar, nomor_wa_admin, teks_running_text, ongkir, no_rekening, nama_bank, whatsapp_admin, nama_toko, alamat_toko) VALUES
      (1, 1, '2026-07-22 03:47:29', 0, NULL, NULL, 2000, '000701032077530', 'BRI', '87728450708', 'AlfaShop', 'Jalan Pasewaran, RT.5/RW.1, Desa Watukebo, Wongsorejo (Selatan rumah Kepala Desa), Anggel No 2 Dari Utara');
    `);

    await connection.query(`
      INSERT INTO pesanan (id, nama_pelanggan, whatsapp, alamat, total_harga, potongan_harga, status, item_pesanan, created_at, kode_voucher, updated_at) VALUES
      (1, 'agil', '08132913732', 'dfghaiubsxiugwebwhqedd7hwe9d7hwd', 10000, 0, 'Selesai', NULL, '2026-05-07 14:48:31', NULL, '2026-06-24 11:03:14'),
      (2, 'agil', '08132913732', 'dfghaiubsxiugwebwhqedd7hwe9d7hwd', 10000, 0, 'Selesai', NULL, '2026-05-07 14:48:33', NULL, '2026-06-24 11:03:14'),
      (3, 'agil', '08132913732', 'dfghaiubsxiugwebwhqedd7hwe9d7hwd', 10000, 0, 'Selesai', NULL, '2026-05-07 14:49:20', NULL, '2026-06-24 11:03:14'),
      (4, 'Agil Alditiar', '08132913732', 'Gahsisiejjsje,sjsoeoeoeieicw,wka9w8eh4kk3ev,e929', 94500, 0, 'Selesai', NULL, '2026-05-11 06:40:47', NULL, '2026-06-24 11:03:14'),
      (5, 'Agil Alditiar', '+62 813-2913-732', 'Vagsuwieoe8h3bdnx sisosmes.sosis.sos.sisgs ', 94500, 0, 'Selesai', NULL, '2026-05-11 07:24:12', NULL, '2026-06-24 11:03:14'),
      (6, 'Agil Alditiar', '+62 813-2913-732', 'Vagsuwieoe8h3bdnx sisosmes.sosis.sos.sisgs ', 94500, 0, 'Selesai', NULL, '2026-05-11 07:24:19', NULL, '2026-06-24 11:03:14'),
      (7, 'Agil Alditiar', '+62 813-2913-732', 'Vagsuwieoe8h3bdnx sisosmes.sosis.sos.sisgs ', 94500, 0, 'Selesai', NULL, '2026-05-11 07:26:38', NULL, '2026-06-24 11:03:14'),
      (8, 'Agil Alditiar', '+62 813-2913-732', 'Vagsuwieoe8h3bdnx sisosmes.sosis.sos.sisgs ', 94500, 0, 'Selesai', NULL, '2026-05-11 07:26:53', NULL, '2026-06-24 11:03:14'),
      (9, 'Agil alditiar', '+62 813-2913-732', 'Watukebo kec. Wongsorejo kab. Banyuwangi', 173500, 0, 'Selesai', NULL, '2026-05-11 15:16:14', NULL, '2026-06-24 11:03:14'),
      (10, 'Agil alditiar', '+62 813-2913-732', 'Desa watukebo kec.wongsorejo kab. Banyuwangi', 93500, 0, 'Selesai', NULL, '2026-05-11 15:22:27', NULL, '2026-06-24 11:03:14'),
      (11, 'Agil alditiar', '+62 813-2913-732', 'Desa watukebo kec.wongsorejo kab. Banyuwangi', 93500, 0, 'Selesai', NULL, '2026-05-11 15:26:23', NULL, '2026-06-24 11:03:14'),
      (12, 'Agil Alditiar ', '+62 813-2913-732', 'Desa Watukebo kec. Wongsorejo kab. Banyuwangi', 90000, 0, 'Selesai', NULL, '2026-05-11 15:27:14', NULL, '2026-06-24 11:03:14'),
      (13, 'Agil alditiar', '+62 813-2913-732', 'Watukebo', 90000, 0, 'Selesai', NULL, '2026-05-11 15:35:45', NULL, '2026-06-24 11:03:14'),
      (14, 'Agil Alditiar Safara', '08132913732', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 90000, 0, 'Selesai', NULL, '2026-05-12 03:54:01', NULL, '2026-06-24 11:03:14'),
      (15, 'Agil Alditiar Safara', '0257934545', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 26500, 0, 'Selesai', NULL, '2026-05-13 05:08:02', NULL, '2026-06-24 11:03:14'),
      (16, 'Agil Alditiar Safara', '0257934545', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 146000, 0, 'Selesai', NULL, '2026-05-14 05:54:47', NULL, '2026-06-24 11:03:14'),
      (17, 'Agil Alditiar Safara', '0257934545', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 161500, 0, 'Selesai', NULL, '2026-05-14 06:12:14', NULL, '2026-06-24 11:03:14'),
      (18, 'Agil Alditiar Safara', '0257934545', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 177000, 0, 'Selesai', NULL, '2026-05-14 06:15:10', NULL, '2026-06-24 11:03:14'),
      (19, 'Agil Alditiar Safara', '0257934545', 'Ambil di Toko: AlfaShop Sudirman', 43500, 0, 'Selesai', NULL, '2026-05-14 06:22:40', NULL, '2026-06-24 11:03:14'),
      (20, 'Aska Dafia Ramadhani', '628132913732', 'Jalan pasewaran, desa watukebo kec. Wongsorejo. Kab. Banyuwangi. Keselatan rumah kades perkiraan 500m', 161500, 0, 'Selesai', NULL, '2026-05-14 06:38:37', NULL, '2026-06-24 11:03:14'),
      (21, 'Aska Dafia Ramadhani', '08132913732', 'jalan pasewaran, desa watukebo, kec wongsorejo, kab banyuwangi. keselatan rumah kepala desa', 70000, 0, 'Selesai', NULL, '2026-06-01 16:09:08', NULL, '2026-06-24 11:03:14'),
      (22, 'Aska Dafia Ramadhani', '08132913732', 'jalan pasewaran, desa watukebo, kec wongsorejo, kab banyuwangi. keselatan rumah kepala desa', 153000, 0, 'Selesai', NULL, '2026-06-01 16:16:01', NULL, '2026-06-24 11:03:14'),
      (23, 'Aska Dafia Ramadhani', '08132913732', 'jalan pasewaran, desa watukebo, kec wongsorejo, kab banyuwangi. keselatan rumah kepala desa', 280000, 0, 'Selesai', NULL, '2026-06-01 16:46:59', NULL, '2026-06-24 11:03:14'),
      (24, 'Aska Dafia Ramadhani', '08132913732', 'jalan pasewaran, desa watukebo, kec wongsorejo, kab banyuwangi. keselatan rumah kepala desa', 295500, 0, 'Selesai', NULL, '2026-06-01 16:53:41', NULL, '2026-06-24 11:03:14'),
      (25, 'Anis Nur Aini', '0257934545', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 176498, 0, 'Selesai', NULL, '2026-06-09 09:10:16', NULL, '2026-06-24 11:03:14'),
      (26, 'Aska Dafia Ramadhani', '62 813-2913-732', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 161994, 0, 'Selesai', NULL, '2026-06-15 13:23:28', NULL, '2026-06-24 11:03:14'),
      (27, 'Aska Dafia Ramadhani', '62 813-2913-732', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter', 161994, 0, 'Dibatalkan', NULL, '2026-06-15 13:32:41', NULL, '2026-06-24 11:07:03'),
      (28, 'Pembeli Offline (Kasir)', '-', 'Toko AlfaShop', 419000, 0, 'Selesai', NULL, '2026-07-12 13:43:38', NULL, '2026-07-12 13:43:38'),
      (29, 'Pembeli Offline (Kasir)', '-', 'Toko AlfaShop', 131000, 0, 'Selesai', NULL, '2026-07-12 13:49:28', NULL, '2026-07-12 13:49:28'),
      (30, 'sidki ali ', '085210721761', 'Ambil di Toko Pusat AlfaShop', 52000, 0, 'Selesai', NULL, '2026-07-21 17:40:23', NULL, '2026-07-21 17:59:16'),
      (31, 'sidki ali ', '085210721761', 'Ambil di Toko Pusat AlfaShop', 28000, 0, 'Selesai', NULL, '2026-07-21 17:44:43', NULL, '2026-07-21 18:00:13'),
      (32, 'sidki ali ', '085210721761', 'Ambil di Toko Pusat AlfaShop', 28000, 0, 'Selesai', NULL, '2026-07-21 17:45:58', NULL, '2026-07-21 18:00:06'),
      (33, 'sidki ali ', '085210721761', 'Ambil di Toko Pusat AlfaShop', 14498, 0, 'Selesai', NULL, '2026-07-21 17:51:25', NULL, '2026-07-21 17:59:59'),
      (34, 'sidki ali ', '085210721761', 'Ambil di Toko Pusat AlfaShop', 28000, 0, 'Selesai', NULL, '2026-07-21 17:52:14', NULL, '2026-07-21 17:59:52'),
      (35, 'sidki ali ', '085210721761', 'Ambil di Toko Pusat AlfaShop', 14498, 0, 'Selesai', NULL, '2026-07-21 17:58:20', NULL, '2026-07-21 17:59:43'),
      (36, 'Aska Dafia Ramadhani', '62 813-2913-732', 'Ambil di Toko Pusat AlfaShop', 28000, 0, 'Selesai', NULL, '2026-07-22 03:36:54', NULL, '2026-07-22 03:38:58');
    `);

    await connection.query(`
      INSERT INTO produk (id, nama_produk, kategori, harga, satuan, gambar_url, deskripsi, tersedia, created_at, stok) VALUES
      (1, 'Beras Gandrung berat 5kg Rp 103.000,00', 'Beras & Sembako', 103000, 'karung', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784789769/alfashop/products/itweqieqnimyhn7vn4yv.jpg', 'Beras Gandrung Premium - 5 kg Beras putih pilihan dengan kualitas terjamin. Menghasilkan nasi yang pulen, bersih, dan harum untuk konsumsi keluarga sehari-hari. • Berat Bersih: 5 kg. • Kualitas: Sosoh bersih, tanpa pemutih, dan tanpa pengawet. • Tekstur: Pulen dan enak. • Pengemasan: Kami packing dengan baik dan aman agar beras tidak pecah atau bocor saat pengiriman.', 1, '2026-05-06 04:49:22', 19),
      (2, 'Sedaap Goreng 1 dus isi 40', 'Mie & Instan', 110000, 'Kardus', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784789973/alfashop/products/n0ew9lz7cwqb0ubtv8ok.jpg', 'Mie Sedaap Goreng adalah merek lain dari mie instan yang juga populer di Indonesia. Mie ini memiliki tekstur yang lembut dan kenyal dengan rasa bumbu yang khas dan kuat. Bumbunya mencakup rasa gurih dan sedikit manis, memberikan sensasi rasa yang menyenangkan. Mie Sedaap Goreng biasanya disajikan dengan bumbu kering dan minyak bumbu yang dicampur menjadi satu. Sama seperti Indomie, Mie Sedaap Goreng juga sering ditambah dengan telur, ayam, atau sayuran untuk menambah rasa dan nutrisi. Ini adalah pilihan lain yang baik untuk makanan cepat saji yang lezat dan memuaskan', 1, '2026-05-06 04:49:22', 12),
      (3, 'AQUA AIR MINERAL BOTOL 600 ML ', 'Minuman', 24000, 'Kardus', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784789678/alfashop/products/gloj8qaaggumqlehkkxx.jpg', 'Aqua adalah merk air minum dalam kemasan yang dipersembahkan oleh Danone Aqua dan telah hadir untuk Indonesia sejak tahun 1974 Sebagai persembahan untuk masyarakat Indonesia Danone Aqua mempersembahkan segala kebaikan air dalam kemasan Aqua Botol 600ml Produk terbaru Danone Aqua ini dihasilkan dari sumber mata air pilihan yang terjaga segala kemurnian dan kandungan mineralnya Selanjutnya Aqua Botol 600ml dikemas melalui proses yang higienis dan terjamin sehat air minum dalam kemasan ini adalah pilihan yang tepat untuk menjaga hidup dan hari hari Anda tetap sehat', 1, '2026-05-06 04:49:22', 18),
      (4, 'Tepung segitigabiru 1kg', 'Beras & Sembako', 14498, 'Ecer', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784790049/alfashop/products/f1g1izhby1m5zygvjq1b.jpg', 'Tepung Terigu Segitiga Biru Ekonomis 1 kg ', 1, '2026-05-06 05:46:32', 7),
      (5, 'KOPI INSTAN KAPAL API 150 GRAM COFFEE HITAM BUBUK MURAH NIKMAT ', 'Beras & Sembako', 28000, 'Renteng', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784789541/alfashop/products/cseozllqjbxhsrwmwsgy.jpg', 'KAPAL API KOPI HITAM KOPI BUBUK COFFEE KOPI INSTAN Kopi Kapal Api Special 150 gr Kopi Kapal Api Special merupakan kopi yang diolah dari biji kopi pilihan dengan proses modern sehingga menjadikan kopi kapal api harum dan nikmat. Terbuat dari 100% kopi murni', 1, '2026-05-14 05:53:09', 15),
      (6, 'Kapal Api 1 KartonKopi Kapal Api Special Mix 23Gr X 12 Renceng 1 Dus', 'Beras & Sembako', 280000, 'Kardus', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784789319/alfashop/products/fn8gd4bw0abe00xwmn84.jpg', '[KAPAL API 1 KARTON] KOPI KAPAL API Special Mix 23gr x 12 Renceng 1 DUS - Kopi Hitam + Gula | StoryofMU Kopi Kapal Api Special Mix 25 gr 1 karton isi 12 renceng x 10 sachet. Kopi Kapal Api terbuat dari biji kopi pilihan dan diproses dengan mesin yang paling modern yang menghasilkan kopi berkualitas tinggi dengan Aroma terbaik dan Rasa yang enak. Kapal Api Special Mix Dibuat dari Biji kopi pilihan yang diolah dengan mesin yang paling modern dan campuran gula murni. Menjadikannya paduan spesial dari kopi dan gula. Kemasan Praktisnya, membuat kopi Anda siap seduh dengan aroma kopi senikmat selera pilihan', 1, '2026-07-21 18:02:08', 19),
      (7, 'Laptop', 'Beras & Sembako', 158000000, 'Kardus', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784791396/alfashop/products/ksgnnhfgkkh2d9s2c0ki.jpg', 'Mara belli pas jek perak tengghu malolo', 1, '2026-07-23 07:24:10', 12);
    `);

    await connection.query(`
      INSERT INTO detail_pesanan (id, pesanan_id, produk_id, jumlah, subtotal) VALUES
      (1, 11, 1, 1, 75000), (2, 11, 2, 1, 3500), (3, 12, 1, 1, 75000), (4, 13, 1, 1, 75000),
      (5, 14, 1, 1, 75000), (6, 15, 2, 3, 10500), (7, 15, 4, 1, 1000), (8, 16, 1, 1, 103000),
      (9, 16, 5, 1, 28000), (10, 17, 4, 1, 15500), (11, 17, 5, 1, 28000), (12, 17, 1, 1, 103000),
      (13, 18, 5, 1, 28000), (14, 18, 2, 1, 110000), (15, 18, 3, 1, 24000), (16, 19, 5, 1, 28000),
      (17, 19, 4, 1, 15500), (18, 20, 5, 1, 28000), (19, 20, 4, 1, 15500), (20, 20, 1, 1, 103000),
      (21, 21, 3, 1, 24000), (22, 21, 4, 2, 31000), (23, 22, 5, 1, 28000), (24, 22, 2, 1, 110000),
      (25, 23, 5, 1, 28000), (26, 23, 2, 1, 110000), (27, 23, 3, 1, 24000), (28, 23, 1, 1, 103000),
      (29, 24, 5, 1, 28000), (30, 24, 4, 1, 15500), (31, 24, 2, 1, 110000), (32, 24, 3, 1, 24000),
      (33, 24, 1, 1, 103000), (34, 25, 5, 1, 28000), (35, 25, 4, 1, 14498), (36, 25, 3, 1, 24000),
      (37, 25, 2, 1, 110000), (38, 26, 3, 1, 24000), (39, 26, 4, 2, 27994), (40, 26, 2, 1, 110000),
      (41, 27, 3, 1, 24000), (42, 27, 4, 2, 27994), (43, 27, 2, 1, 110000), (44, 28, 1, 3, 309000),
      (45, 28, 2, 1, 110000), (46, 29, 5, 1, 28000), (47, 29, 1, 1, 103000), (48, 30, 5, 1, 28000),
      (49, 30, 3, 1, 24000), (50, 31, 5, 1, 28000), (51, 32, 5, 1, 28000), (52, 33, 4, 1, 14498),
      (53, 34, 5, 1, 28000), (54, 35, 4, 1, 14498), (55, 36, 5, 1, 28000);
    `);

    await connection.query(`
      INSERT INTO users (id, name, email, whatsapp, password, created_at, role) VALUES
      (2, 'Aska Dafia Ramadhani', 'ramadhanidafian5@gmail.com', '62 813-2913-732', '$2b$10$ltUD9PLL/ABEGYj.2JQB1OzQXwot/k266U92hqAp6rcXMVn0fEG6q', '2026-05-14 06:36:17', 'pelanggan'),
      (3, 'Anis Nur Aini', 'admin@alfashop.com', '087728450708', '$2b$10$gv0xvI9tp/vzFhdGomUFP.EFsoSggMqZLcW2H9Kb1PGsT6hdkrd/e', '2026-06-01 15:15:22', 'admin');
    `);

    console.log("Enabling foreign key checks...");
    await connection.query('SET FOREIGN_KEY_CHECKS=1;');

    console.log("Data import completed successfully!");
  } catch (error) {
    console.error("Error importing data:", error.message);
  }

  process.exit(0);
}

importData();
