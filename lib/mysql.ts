import mysql from 'mysql2/promise';

// Cek apakah menggunakan DATABASE_URL (seperti dari TiDB Cloud)
const dbUrl = process.env.DATABASE_URL;
const isTiDB = dbUrl ? dbUrl.includes('tidbcloud') : (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud'));

// Konfigurasi koneksi
const config: any = dbUrl ? {
  uri: dbUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
} : {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'alfashop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// TiDB Cloud mensyaratkan koneksi SSL
if (isTiDB) {
  config.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
}

export const pool = mysql.createPool(config);

export async function query(sql: string, values?: any[]) {
  const [results] = await pool.execute(sql, values);
  return results;
}