const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      connectTimeout: 20000 // 20s
    });

    console.log("Adding latitude and longitude to pesanan...");
    try {
      await connection.execute("ALTER TABLE pesanan ADD COLUMN latitude VARCHAR(50) DEFAULT NULL, ADD COLUMN longitude VARCHAR(50) DEFAULT NULL;");
      console.log("Success adding to pesanan.");
    } catch(e) {
      console.log("Maybe pesanan already has them:", e.message);
    }

    console.log("Adding latitude and longitude to pelanggan...");
    try {
      await connection.execute("ALTER TABLE pelanggan ADD COLUMN latitude VARCHAR(50) DEFAULT NULL, ADD COLUMN longitude VARCHAR(50) DEFAULT NULL;");
      console.log("Success adding to pelanggan.");
    } catch(e) {
      console.log("Maybe pelanggan already has them:", e.message);
    }

    process.exit(0);
  } catch (e) {
    console.log("Connection error:", e.message);
    process.exit(1);
  }
}

migrate();
