import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { Icon } from "@iconify/react";

export const instant = false;

type Anggota = RowDataPacket & {
  id: number;
  nama: string;
  email: string | null;
  no_telepon: string | null;
  alamat: string | null;
};

type Setoran = RowDataPacket & {
  id: number;
  jenis_sampah: string;
  berat: number | string;
  total_harga: number | string;
  status: string;
  tanggal: string;
};

type Statistik = RowDataPacket & {
  jumlah_setoran: number;
  total_berat: number | string;
  total_pendapatan: number | string;
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function tanggalIndonesia(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function MemberProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) notFound();

  const [anggotaRows] = await pool.execute<Anggota[]>(
    `SELECT id, nama, email, no_telepon, alamat
     FROM anggota WHERE id = ?`,
    [Number(id)]
  );

  const anggota = anggotaRows[0];
  if (!anggota) notFound();

  const [statRows] = await pool.execute<Statistik[]>(
    `SELECT
       COUNT(*) AS jumlah_setoran,
       COALESCE(SUM(berat_kg), 0) AS total_berat,
       COALESCE(SUM(total_harga), 0) AS total_pendapatan
     FROM setoran
     WHERE anggota_id = ?`,
    [Number(id)]
  );

  const statistik = statRows[0];

  const [riwayat] = await pool.execute<Setoran[]>(
    `SELECT
       id,
       jenis_sampah,
       berat_kg AS berat,
       total_harga,
       status,
       tanggal_setor AS tanggal
     FROM setoran
     WHERE anggota_id = ?
     ORDER BY tanggal_setor DESC, id DESC`,
    [Number(id)]
  );

  return (
    <div className="wm-layout">
      <aside className="wm-sidebar">
        <Link href="/" className="wm-brand">
          <span className="wm-brand-icon">
            <Icon icon="mdi:recycle" />
          </span>
          <span>EcoBank</span>
        </Link>

        <div className="wm-nav-label">MENU</div>

        <Link href="/" className="wm-nav-link active">
          <Icon icon="mdi:view-dashboard-outline" />
          Dashboard
        </Link>

        <Link href="/waste_manajemen" className="wm-nav-link">
          <Icon icon="mdi:recycle" />
          Waste Management
        </Link>

        <div className="wm-profile">
          <div className="wm-avatar">A</div>
          <div>
            <strong>Admin Ghina</strong>
            <small>Administrator</small>
          </div>
        </div>
      </aside>

      <main className="wm-main">
        <header className="wm-topbar">
        <div className="wm-breadcrumb">
            <Link
            href="/"
            className="back-dashboard"
            aria-label="Kembali ke Dashboard"
            title="Kembali ke Dashboard"
            >
            <Icon icon="mdi:arrow-left" />
            </Link>

            <div>
            <strong>Profil Anggota</strong>
            </div>
        </div>

        <div className="wm-account">
            <div>
            <strong>Admin Ghina</strong>
            <small>Administrator</small>
            </div>
        </div>
        </header>

        <div className="content">
          <section className="welcome">
            <div>
              <p className="date-label">DATA ANGGOTA ECOBANK</p>
            </div>
          </section>

        <section className="member-profile-card">
            <div className="member-profile-avatar">
                {anggota.nama
                .split(" ")
                .map((word) => word[0] || "")
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="member-profile-info">
            <h2 className="member-profile-name">
                {anggota.nama}
            </h2>

            <p className="member-profile-email">
                Profil Anggota · EcoBank
            </p>

            <span className="member-profile-status">
                <Icon icon="mdi:check-circle" />
                Anggota terdaftar
            </span>
            </div>
        </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:package-variant-closed-check" />
              </div>
              <h2>
                {Number(statistik?.jumlah_setoran || 0)} kali
              </h2>
              <small>Total setoran anggota</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:scale-balance" />
              </div>
              <h2>
                {Number(statistik?.total_berat || 0).toLocaleString("id-ID")} kg
              </h2>
              <small>Total berat sampah disetor</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:wallet-outline" />
              </div>
              <h2>
                {rupiah(Number(statistik?.total_pendapatan || 0))}
              </h2>
              <small>Total pendapatan dari sampah</small>
            </article>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Riwayat Setoran</h3>
                <p>Daftar setoran sampah milik {anggota.nama}.</p>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                {riwayat.length} transaksi
              </span>
            </div>

            <div className="table-scroll">
              <table className="collections-table">
                <thead>
                  <tr>
                    <th>Jenis Sampah</th>
                    <th>Berat</th>
                    <th>Pendapatan</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {riwayat.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        Anggota ini belum memiliki riwayat setoran.
                      </td>
                    </tr>
                  ) : (
                    riwayat.map((item) => (
                      <tr key={item.id}>
                        <td>{item.jenis_sampah}</td>
                        <td>
                          {Number(item.berat).toLocaleString("id-ID")} kg
                        </td>
                        <td>
                          {rupiah(Number(item.total_harga))}
                        </td>
                        <td>{tanggalIndonesia(item.tanggal)}</td>
                        <td>
                          <span
                            className={
                              item.status?.toLowerCase() === "confirmed"
                                ? "status-active"
                                : ""
                            }
                          >
                            {item.status?.toLowerCase() === "confirmed"
                              ? "Terkonfirmasi"
                              : item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
