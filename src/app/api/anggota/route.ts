import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Mengambil semua data anggota dari database
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM anggota ORDER BY id DESC"
    );

    return NextResponse.json(rows);
      } catch (error: any) {
      console.error("Gagal mengambil anggota:", error);

      return NextResponse.json(
        {
          message: "Gagal mengambil data anggota",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

// Menambahkan anggota baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nama, email, no_telepon, alamat } = body;

    if (!nama || !email) {
      return NextResponse.json(
        { message: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      `INSERT INTO anggota (nama, email, no_telepon, alamat)
       VALUES (?, ?, ?, ?)`,
      [
        nama,
        email,
        no_telepon || null,
        alamat || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Anggota berhasil ditambahkan",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menambahkan anggota:", error);

    return NextResponse.json(
      { message: "Gagal menambahkan anggota" },
      { status: 500 }
    );
  }
}
