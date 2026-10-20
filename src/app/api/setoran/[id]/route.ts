import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { message: "ID setoran tidak valid" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.execute(
      "DELETE FROM setoran WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Data setoran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data setoran berhasil dihapus",
      id: Number(id),
    });
  } catch (error: any) {
    console.error("Gagal menghapus setoran:", error);

    return NextResponse.json(
      {
        message: "Gagal menghapus data setoran",
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}