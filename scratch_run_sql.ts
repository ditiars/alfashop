import { query, pool } from './lib/mysql';

async function run() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS variasi_produk (
        id int(11) NOT NULL AUTO_INCREMENT,
        produk_id int(11) NOT NULL,
        nama_variasi varchar(100) NOT NULL,
        harga int(11) NOT NULL,
        stok int(11) NOT NULL DEFAULT 0,
        harga_grosir int(11) DEFAULT NULL,
        min_grosir int(11) DEFAULT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("Table variasi_produk created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    pool.end();
  }
}

run();
