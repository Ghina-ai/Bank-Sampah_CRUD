"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type Anggota = {
  id: number;
  nama: string;
  email: string;
  no_telepon: string | null;
  alamat: string | null;
};

type Setoran = {
  id: number;
  jenis_sampah: string;
  berat: number | string;
  harga_per_kg: number | string;
  total_harga: number | string;
  status: string;
  tanggal: string;
  nama_anggota: string;
};

export default function Home() {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [setoran, setSetoran] = useState<Setoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSetoran, setLoadingSetoran] = useState(true);

  useEffect(() => {
    async function ambilAnggota() {
      try {
        const response = await fetch("/api/anggota");
        if (!response.ok) throw new Error("Gagal mengambil data anggota");

        setAnggota(await response.json());
      } catch (error) {
        console.error("Error anggota:", error);
      } finally {
        setLoading(false);
      }
    }

    async function ambilSetoran() {
      try {
        const response = await fetch("/api/setoran");
        if (!response.ok) throw new Error("Gagal mengambil data setoran");

        setSetoran(await response.json());
      } catch (error) {
        console.error("Error setoran:", error);
      } finally {
        setLoadingSetoran(false);
      }
    }

    ambilAnggota();
    ambilSetoran();
  }, []);

  const inisial = (nama: string) =>
    nama
      .split(" ")
      .map((kata) => kata[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatRupiah = (nominal: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal);

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";

    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return tanggal;

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const setoranConfirmed = setoran.filter(
    (item) => item.status?.toLowerCase() === "confirmed",
  );

  const jenisRecyclable = [
    "plastik",
    "kertas",
    "kardus",
    "botol",
    "kaleng",
    "kaca",
    "logam",
    "besi",
    "aluminium",
  ];

  const jenisGeneral = ["residu", "sampah umum", "sampah campuran"];

  const totalRecyclable = setoranConfirmed
    .filter((item) =>
      jenisRecyclable.some((jenis) =>
        item.jenis_sampah.toLowerCase().includes(jenis),
      ),
    )
    .reduce((total, item) => total + Number(item.berat), 0);

  const totalGeneral = setoranConfirmed
    .filter((item) =>
      jenisGeneral.some((jenis) =>
        item.jenis_sampah.toLowerCase().includes(jenis),
      ),
    )
    .reduce((total, item) => total + Number(item.berat), 0);

  const totalSavings = setoranConfirmed.reduce(
    (total, item) => total + Number(item.total_harga),
    0,
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
            <strong>Waste Management</strong>
          </div>

          <div className="wm-account">
            <div className="wm-avatar">A</div>
            <div>
              <strong>Admin Ghina</strong>
              <small>Administrator</small>
            </div>
            <span></span>
          </div>
        </header>

        <main className="content">
          <section className="welcome">
            <div>
              <p className="date-label">DASHBOARD PENGELOLAAN SAMPAH</p>
              <h1>Halo, Admin!</h1>
              <p className="subtitle">
                Pantau pengumpulan sampah dan pendapatan warga di sini.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:recycle" />
              </div>
              <h2>
                {loadingSetoran
                  ? "..."
                  : `${totalRecyclable.toLocaleString("id-ID")} kg`}
              </h2>
              <small>Total sampah daur ulang terkumpul</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:trash-can-outline" />
              </div>
              <h2>
                {loadingSetoran
                  ? "..."
                  : `${totalGeneral.toLocaleString("id-ID")} kg`}
              </h2>
              <small>Total sampah umum tercatat</small>
            </article>

            <article className="stat-card">
             <div className="stat-icon">
                <Icon icon="mdi:wallet-outline" />
              </div>
              <h2>{loadingSetoran ? "..." : formatRupiah(totalSavings)}</h2>
              <small>Total pendapatan dari setoran terkonfirmasi</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon">
                <Icon icon="mdi:account-group-outline" />
              </div>
              <h2>{loading ? "..." : `${anggota.length} anggota`}</h2>
              <small>Jumlah warga yang terdaftar</small>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel collections-panel" id="setoran">
              <div className="panel-heading">
                <div>
                  <h3>Setoran Terbaru</h3>
                  <p>Setoran sampah terbaru dari warga</p>
                </div>
              </div>

              <div className="table-scroll">
                <table className="collections-table">
                  <thead>
                    <tr>
                      <th>Jenis Sampah</th>
                      <th>Nama Warga</th>
                      <th>Status</th>
                      <th>Berat</th>
                      <th>Nilai</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingSetoran ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          Memuat data setoran...
                        </td>
                      </tr>
                    ) : setoran.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          Data setoran belum tersedia.
                        </td>
                      </tr>
                    ) : (
                      setoran.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>{item.jenis_sampah}</td>
                          <td>{item.nama_anggota}</td>
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
                          <td>
                            {Number(item.berat).toLocaleString("id-ID")} kg
                          </td>
                          <td>{formatRupiah(Number(item.total_harga))}</td>
                          <td>{formatTanggal(item.tanggal)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel members-panel">
              <div className="panel-heading">
                <div>
                  <h3>Anggota Komunitas</h3>
                  <p>Lihat anggota terdaftar dan informasi kontaknya.</p>
                </div>
              </div>

              <div className="members-list" id="anggota">
                {loading ? (
                  <p className="empty-members">Memuat data anggota...</p>
                ) : anggota.length === 0 ? (
                  <p className="empty-members">Belum ada anggota terdaftar.</p>
                ) : (
                  anggota.map((item) => (
                    <div className="member-row" key={item.id}>
                      <div className="member-avatar">{inisial(item.nama)}</div>

                      <div className="member-details">
                        <strong>{item.nama}</strong>
                        <small>{item.email}</small>
                      </div>

                      <span className="status-active">Terdaftar</span>

                      <button
                        className="view-button"
                        onClick={() =>
                          alert(
                            `Nama: ${item.nama}\nEmail: ${item.email}\nTelepon: ${item.no_telepon || "-"}\nAlamat: ${item.alamat || "-"}`,
                          )
                        }
                      >
                        Lihat Detail
                      </button>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </main>
      </main>
    </div>
  );
}
