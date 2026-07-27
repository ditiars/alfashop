const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    uri: "mysql://22TXjSMZLDGSdFk.root:AqrO11g5N7DWPkR4@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test",
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  const [cols] = await connection.execute("SHOW COLUMNS FROM produk");
  console.log(cols);
  process.exit(0);
}

check();
