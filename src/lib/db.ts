import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import path from "node:path";

const required = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

const missing = required.filter(
  (key) => !process.env[key]
);

let ca = "";

try {
  ca = readFileSync(
    path.join(process.cwd(), "certs", "ca.pem"),
    "utf8"
  );
} catch (error) {
  console.error("Gagal membaca sertifikat CA:", error);

  throw new Error(
    "File sertifikat CA tidak ditemukan. Pastikan ada di certs/ca.pem."
  );
}

if (missing.length > 0) {
  throw new Error(
    `Konfigurasi belum lengkap. Variabel kosong: ${missing.join(", ")}`
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;