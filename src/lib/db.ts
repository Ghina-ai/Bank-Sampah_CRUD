import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

const caPath = path.join(process.cwd(), "ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(caPath, "utf8"),
  },
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
