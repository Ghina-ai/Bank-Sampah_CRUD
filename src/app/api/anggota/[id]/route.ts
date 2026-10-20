import { NextResponse } from "next/server";
import pool from "@/lib/db";

type Context = {
  params: Promise<{ id: string }>;
};

// PUT: mengedit anggota
export async function PUT(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, email, no_telepon, alamat } = body;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return NextResponse.json(
        { message: "ID tidak valid" },
        { status: 400 }
      );
    }

    if (!nama || !email) {
      return NextResponse.json(
        { message: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.execute(
      `UPDATE anggota
       SET nama = ?, email = ?, no_telepon = ?, alamat = ?
       WHERE id = ?`,
      [nama, email, no_telepon || null, alamat || null, Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Anggota berhasil diperbarui",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal memperbarui anggota" },
      { status: 500 }
    );
  }
}

// DELETE: menghapus anggota
export async function DELETE(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return NextResponse.json(
        { message: "ID tidak valid" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.execute(
      "DELETE FROM anggota WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Anggota berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal menghapus anggota" },
      { status: 500 }
    );
  }
}
