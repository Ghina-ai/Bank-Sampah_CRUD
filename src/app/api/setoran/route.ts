import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: mengambil semua data setoran
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.id,
        s.jenis_sampah,
        s.berat_kg AS berat,
        s.harga_per_kg,
        s.total_harga,
        s.status,
        s.tanggal_setor AS tanggal,
        a.nama AS nama_anggota
      FROM setoran s
      JOIN anggota a ON a.id = s.anggota_id
      ORDER BY s.id DESC
    `);

    return NextResponse.json(rows);
      } catch (error: any) {
      console.error("Gagal mengambil data setoran:", error);

      return NextResponse.json(
        {
          message: "Gagal mengambil data setoran",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

// POST: menambahkan data setoran
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      anggota_id,
      jenis_sampah,
      berat,
      harga_per_kg,
      status,
    } = body;

    // Validasi data
    const anggotaId = Number(anggota_id);
    const beratAngka = Number(berat);
    const hargaAngka = Number(harga_per_kg);

    if (
      !Number.isInteger(anggotaId) ||
      anggotaId <= 0 ||
      typeof jenis_sampah !== "string" ||
      !jenis_sampah.trim() ||
      berat == null ||
      harga_per_kg == null
    ) {
      return NextResponse.json(
        { message: "Data setoran belum lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(beratAngka) ||
      !Number.isFinite(hargaAngka) ||
      beratAngka <= 0 ||
      hargaAngka < 0
    ) {
      return NextResponse.json(
        { message: "Berat atau harga tidak valid" },
        { status: 400 }
      );
    }

    const statusSetoran = status || "Pending";
    const statusValid = ["Pending", "Confirmed", "Rejected"];

    if (!statusValid.includes(statusSetoran)) {
      return NextResponse.json(
        { message: "Status setoran tidak valid" },
        { status: 400 }
      );
    }

    // Pastikan anggota terdaftar
    const [anggotaRows]: any = await pool.query(
      "SELECT id FROM anggota WHERE id = ?",
      [anggotaId]
    );

    if (anggotaRows.length === 0) {
      return NextResponse.json(
        { message: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung total untuk respons
    // MySQL tetap menghitung total_harga di database
    const totalHarga = beratAngka * hargaAngka;

    // Simpan data setoran
    // total_harga tidak di-INSERT karena generated column
    const [result]: any = await pool.query(
      `INSERT INTO setoran
        (
          anggota_id,
          jenis_sampah,
          berat_kg,
          harga_per_kg,
          status,
          tanggal_setor
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_DATE())`,
      [
        anggotaId,
        jenis_sampah.trim(),
        beratAngka,
        hargaAngka,
        statusSetoran,
      ]
    );

    return NextResponse.json(
      {
        message: "Setoran berhasil ditambahkan",
        data: {
          id: result.insertId,
          anggota_id: anggotaId,
          jenis_sampah: jenis_sampah.trim(),
          berat: beratAngka,
          harga_per_kg: hargaAngka,
          total_harga: totalHarga,
          status: statusSetoran,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Gagal menambahkan setoran:", error);

    return NextResponse.json(
      {
        message: "Gagal menambahkan data setoran",
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
