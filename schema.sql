SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Table structure for table `banner`
CREATE TABLE `banner` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gambar_url` longtext NOT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `judul` varchar(100) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `urutan` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `banner` (`id`, `gambar_url`, `aktif`, `created_at`, `judul`, `link_url`, `urutan`) VALUES
(2, 'https://res.cloudinary.com/bvwttel5/image/upload/v1784785830/alfashop/banners/hxzuua3h1nundby2unzv.jpg', 1, '2026-06-03 17:03:18', 'mumpung lagi ada promo niih!!!', NULL, 1);

-- 2. Table structure for table `kupon`
CREATE TABLE `kupon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_kupon` varchar(50) DEFAULT NULL,
  `tipe_diskon` enum('persen','nominal') NOT NULL,
  `nilai_diskon` int(11) NOT NULL,
  `kuota` int(11) DEFAULT NULL,
  `berlaku_sampai` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `min_belanja` int(11) NOT NULL DEFAULT 0,
  `max_diskon` int(11) DEFAULT NULL,
  `digunakan` int(11) NOT NULL DEFAULT 0,
  `produk_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_kupon` (`kode_kupon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `kupon` (`id`, `kode_kupon`, `tipe_diskon`, `nilai_diskon`, `kuota`, `berlaku_sampai`, `created_at`, `aktif`, `min_belanja`, `max_diskon`, `digunakan`, `produk_id`) VALUES
(1, 'ALFA432', 'persen', 5, 8, '2026-06-20 10:00:00', '2026-06-03 17:08:28', 0, 50000, 130000, 0, NULL),
(2, NULL, 'nominal', 501, NULL, '2026-06-19 10:00:00', '2026-06-03 17:26:39', 0, 0, NULL, 0, 4);

-- 3. Table structure for table `pelanggan`
CREATE TABLE `pelanggan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_pelanggan` varchar(255) NOT NULL,
  `no_wa` varchar(50) NOT NULL,
  `alamat` text DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pelanggan` (`id`, `nama_pelanggan`, `no_wa`, `alamat`) VALUES
(1, 'Aska Dafian Ramadhani', '08132913732', 'jalan pasewaran, desa watukebo, kec wongsorejo, kab banyuwangi. keselatan rumah kepala desa'),
(2, 'Aska Dafia Ramadhani', '62 813-2913-732', 'desa watukebo RT/RW 05.05 kec. wongsorejo kab. banyuwangi, keselatan rumah kades sekitar 500 meter');

-- 4. Table structure for table `pengaturan`
CREATE TABLE `pengaturan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `is_open` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ongkir_standar` int(11) DEFAULT 0,
  `nomor_wa_admin` varchar(20) DEFAULT NULL,
  `teks_running_text` text DEFAULT NULL,
  `ongkir` int(11) DEFAULT 0 COMMENT 'Biaya ongkos kirim standar (Rp)',
  `no_rekening` varchar(100) DEFAULT NULL,
  `nama_bank` varchar(100) DEFAULT NULL,
  `whatsapp_admin` varchar(20) DEFAULT NULL COMMENT 'Nomor WA admin penerima notifikasi',
  `nama_toko` varchar(100) DEFAULT 'AlfaShop',
  `alamat_toko` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pengaturan` (`id`, `is_open`, `updated_at`, `ongkir_standar`, `nomor_wa_admin`, `teks_running_text`, `ongkir`, `no_rekening`, `nama_bank`, `whatsapp_admin`, `nama_toko`, `alamat_toko`) VALUES
(1, 1, '2026-07-22 03:47:29', 0, NULL, NULL, 2000, '000701032077530', 'BRI', '87728450708', 'AlfaShop', 'Jalan Pasewaran, RT.5/RW.1, Desa Watukebo, Wongsorejo (Selatan rumah Kepala Desa), Anggel No 2 Dari Utara');

-- 5. Table structure for table `pesanan`
CREATE TABLE `pesanan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_pelanggan` varchar(255) DEFAULT 'Pelanggan Kasir',
  `whatsapp` varchar(20) DEFAULT '-',
  `alamat` text DEFAULT NULL,
  `total_harga` int(11) NOT NULL,
  `potongan_harga` int(11) DEFAULT 0,
  `status` enum('Menunggu','Proses','Selesai','Batal','Dibatalkan') DEFAULT 'Menunggu',
  `item_pesanan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `kode_voucher` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Table structure for table `produk`
CREATE TABLE `produk` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_produk` varchar(255) NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `harga` int(11) NOT NULL,
  `satuan` varchar(50) DEFAULT NULL,
  `gambar_url` text DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `tersedia` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `stok` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `produk` (`id`, `nama_produk`, `kategori`, `harga`, `satuan`, `gambar_url`, `deskripsi`, `tersedia`, `created_at`, `stok`) VALUES
(1, 'Beras Gandrung berat 5kg Rp 103.000,00', 'Beras & Sembako', 103000, 'karung', 'https://res.cloudinary.com/bvwttel5/image/upload/v1784789769/alfashop/products/itweqieqnimyhn7vn4yv.jpg', 'Beras Gandrung Premium - 5 kg', 1, '2026-05-06 04:49:22', 19);

-- 7. Table structure for table `detail_pesanan`
CREATE TABLE `detail_pesanan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pesanan_id` int(11) NOT NULL,
  `produk_id` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `subtotal` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pesanan_id` (`pesanan_id`),
  KEY `produk_id` (`produk_id`),
  CONSTRAINT `detail_pesanan_ibfk_1` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detail_pesanan_ibfk_2` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Table structure for table `users`
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('admin','pelanggan') DEFAULT 'pelanggan',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`id`, `name`, `email`, `whatsapp`, `password`, `created_at`, `role`) VALUES
(2, 'Aska Dafia Ramadhani', 'ramadhanidafian5@gmail.com', '62 813-2913-732', '$2b$10$ltUD9PLL/ABEGYj.2JQB1OzQXwot/k266U92hqAp6rcXMVn0fEG6q', '2026-05-14 06:36:17', 'pelanggan'),
(3, 'Anis Nur Aini', 'admin@alfashop.com', '087728450708', '$2b$10$gv0xvI9tp/vzFhdGomUFP.EFsoSggMqZLcW2H9Kb1PGsT6hdkrd/e', '2026-06-01 15:15:22', 'admin');

-- 9. Table structure for table `voucher`
CREATE TABLE `voucher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(50) NOT NULL,
  `jenis` enum('persen','nominal') NOT NULL DEFAULT 'persen',
  `nilai` int(11) NOT NULL COMMENT 'Persentase atau Nominal potongan',
  `min_belanja` int(11) DEFAULT 0 COMMENT 'Minimal total belanja agar voucher berlaku',
  `max_diskon` int(11) DEFAULT NULL COMMENT 'Batas maksimal diskon (khusus jenis persen)',
  `kuota` int(11) DEFAULT NULL COMMENT 'NULL = tidak terbatas',
  `digunakan` int(11) DEFAULT 0 COMMENT 'Berapa kali sudah dipakai',
  `aktif` tinyint(1) DEFAULT 1,
  `berlaku_sampai` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- 10. Table structure for table `variasi_produk`
CREATE TABLE `variasi_produk` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produk_id` int(11) NOT NULL,
  `nama_variasi` varchar(100) NOT NULL,
  `harga` int(11) NOT NULL,
  `stok` int(11) NOT NULL DEFAULT 0,
  `harga_grosir` int(11) DEFAULT NULL,
  `min_grosir` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`produk_id`) REFERENCES `produk`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
