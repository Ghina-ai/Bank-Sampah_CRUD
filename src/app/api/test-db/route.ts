import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SHOW TABLES");

    return NextResponse.json({
      message: "Koneksi MySQL berhasil!",
      tables: rows,
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      { message: "Koneksi database gagal" },
      { status: 500 }
    );
  }
}
