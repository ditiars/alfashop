import { query } from "../lib/mysql";

async function main() {
  try {
    await query("ALTER TABLE pesanan MODIFY COLUMN status VARCHAR(50) DEFAULT 'Menunggu'");
    console.log("Success: Status column changed to VARCHAR(50)");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}
main();
