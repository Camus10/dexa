/**
 * Runner seed tanpa perlu CLI mysql.
 *
 * Cara pakai (dari folder backend/attendance-service):
 *   node scripts/seed.js
 *
 * Script ini membaca kredensial dari .env attendance-service, lalu
 * menjalankan docs/seed-data.sql (mengosongkan tabel + mengisi data contoh).
 * Tabel harus sudah pernah dibuat oleh service (TypeORM synchronize: true).
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

/** Parser .env sederhana (tanpa dependency tambahan). */
function loadEnv(filePath) {
  const env = {};

  if (!fs.existsSync(filePath)) {
    return env;
  }

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');

    if (separator === -1) {
      continue;
    }

    env[trimmed.slice(0, separator).trim()] = trimmed
      .slice(separator + 1)
      .trim();
  }

  return env;
}

async function main() {
  const serviceDir = path.resolve(__dirname, '..');
  const env = loadEnv(path.join(serviceDir, '.env'));
  const seedFile = path.resolve(serviceDir, '../../docs/seed-data.sql');

  if (!fs.existsSync(seedFile)) {
    console.error('Berkas seed tidak ditemukan: ' + seedFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedFile, 'utf8');

  const connection = await mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || 'root',
    password: env.DB_PASS || '',
    multipleStatements: true,
  });

  try {
    console.log('Menjalankan seed data...');
    await connection.query(sql);
    console.log('Seed selesai.');
    console.log(
      'Akun demo: hrd@dexa.co.id / budi@dexa.co.id / citra@dexa.co.id (password123)',
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Seed gagal:', error.message);
  process.exit(1);
});
