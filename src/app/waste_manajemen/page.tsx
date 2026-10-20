"use client";

import { useEffect, useState, type FormEvent } from "react";
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

export default function WasteManagementPage() {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [setoran, setSetoran] = useState<Setoran[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [anggotaId, setAnggotaId] = useState("");
  const [jenisSampah, setJenisSampah] = useState("");
  const [berat, setBerat] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState("");
  const [status, setStatus] = useState("Pending");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  

async function ambilData() {
  try {
    const anggotaResponse = await fetch("/api/anggota", {
      cache: "no-store",
    });

    if (!anggotaResponse.ok) {
      throw new Error("Gagal mengambil data anggota.");
    }

    const anggotaData = await anggotaResponse.json();

    console.log("Anggota dari database:", anggotaData);

    if (!Array.isArray(anggotaData)) {
      throw new Error("Format data anggota tidak sesuai.");
    }

    setAnggota(anggotaData);

    const setoranResponse = await fetch("/api/setoran", {
      cache: "no-store",
    });

    if (!setoranResponse.ok) {
      throw new Error("Gagal mengambil data setoran.");
    }

    const setoranData = await setoranResponse.json();

    console.log("Setoran dari database:", setoranData);

    if (!Array.isArray(setoranData)) {
      throw new Error("Format data setoran tidak sesuai.");
    }

    setSetoran(setoranData);
    setError("");
  } catch (err) {
    console.error("Gagal memuat data:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Data gagal dimuat."
    );
  } finally {
    setLoading(false);
  }
}



  useEffect(() => {
    ambilData();
  }, []);

  const filteredSetoran = setoran.filter((item) =>
    `${item.jenis_sampah} ${item.nama_anggota} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  async function tambahSetoran(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!anggotaId || !jenisSampah.trim() || !berat || hargaPerKg === "") {
      setError("Lengkapi semua data setoran terlebih dahulu.");
      return;
    }

    const beratAngka = Number(berat);
    const hargaAngka = Number(hargaPerKg);

    if (
      !Number.isFinite(beratAngka) ||
      !Number.isFinite(hargaAngka) ||
      beratAngka <= 0 ||
      hargaAngka < 0
    ) {
      setError("Berat harus lebih dari 0 dan harga tidak boleh negatif.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/setoran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anggota_id: Number(anggotaId),
          jenis_sampah: jenisSampah.trim(),
          berat: beratAngka,
          harga_per_kg: hargaAngka,
          status,
        }),
      });

      const result = await response.json();

    console.log("Status penyimpanan:", response.status);
    console.log("Hasil penyimpanan:", result);

    if (!response.ok) {
    throw new Error(
        `${result.message || "Gagal menyimpan setoran."}${
        result.error ? ` Detail: ${result.error}` : ""
        }`
    );
    }

      setJenisSampah("");
      setBerat("");
      setHargaPerKg("");
      setAnggotaId("");
      setStatus("Pending");
      setShowForm(false);

      await ambilData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan setoran."
      );
    } finally {
      setSaving(false);
    }
  }

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

        <Link href="/" className="wm-nav-link">
          <Icon icon="mdi:view-dashboard-outline" />
          Dashboard
        </Link>

        <Link href="/waste_manajemen" className="wm-nav-link active">
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

        <section className="wm-content">
          <div className="wm-eyebrow">PENGELOLAAN SAMPAH</div>
          <h1>Data Setoran Sampah</h1>
          <p className="wm-description">
            Catat setoran sampah anggota dan lihat riwayat setoran yang masuk.
          </p>

          <div className="wm-card-toolbar">
            <div className="wm-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Cari nama anggota atau jenis sampah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <span className="wm-total">
              {setoran.length} setoran
            </span>

            <button
              type="button"
              className="wm-add-button"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
            >
              + Tambah Setoran Sampah
            </button>
          </div>

          {error && !showForm && (
            <p role="alert" className="wm-no-results">
              {error}
            </p>
          )}

          {loading ? (
            <p className="wm-empty-hint">Memuat data setoran...</p>
          ) : filteredSetoran.length === 0 ? (
            <p className="wm-empty-hint">
              {search
                ? "Setoran yang kamu cari belum ditemukan."
                : "Belum ada setoran sampah. Data akan muncul di sini setelah setoran ditambahkan."}
            </p>
          ) : (
            <div className="wm-waste-grid">
              {filteredSetoran.map((item) => (
                <article className="wm-waste-card" key={item.id}>
                  <div className="wm-waste-card-top">
                    <div className="wm-waste-icon">♻</div>
                    <span className="wm-status">{item.status}</span>
                  </div>

                  <div className="wm-waste-card-info">
                    <span className="wm-category-label">
                      Setoran #{item.id}
                    </span>
                    <h3>{item.jenis_sampah}</h3>
                    <p>Disetorkan oleh</p>
                    <strong>{item.nama_anggota}</strong>
                  </div>

                  <div className="wm-waste-card-bottom">
                    <div>
                      <small>Berat sampah</small>
                      <strong>
                        {Number(item.berat).toLocaleString("id-ID")} kg
                      </strong>
                      <small>Nilai setoran</small>
                      <strong>
                        {formatRupiah(Number(item.total_harga))}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div
          className="wm-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="wm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-heading"
          >
            <div className="wm-modal-heading">
              <div>
                <h2 id="deposit-heading">Tambah Setoran Sampah</h2>
                <p>Isi informasi anggota dan sampah yang disetorkan.</p>
              </div>

              <button
                type="button"
                className="wm-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Tutup form"
              >
                ×
              </button>
            </div>

            <form onSubmit={tambahSetoran}>
              <label htmlFor="anggota">Nama Anggota</label>
              <select
                id="anggota"
                value={anggotaId}
                onChange={(e) => setAnggotaId(e.target.value)}
                required
              >
                <option value="">Pilih anggota yang menyetor</option>
                {anggota.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} — ID {item.id}
                  </option>
                ))}
              </select>

              {anggota.length === 0 && (
                <small>
                  Belum ada anggota terdaftar. Tambahkan anggota terlebih dahulu.
                </small>
              )}

              <label htmlFor="jenis-sampah">Jenis Sampah</label>
              <input
                id="jenis-sampah"
                value={jenisSampah}
                onChange={(e) => setJenisSampah(e.target.value)}
                placeholder="Contoh: Botol plastik"
                required
              />

              <label htmlFor="berat">Berat Sampah (kg)</label>
              <input
                id="berat"
                type="number"
                min="0.01"
                step="any"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
                placeholder="Masukkan berat sampah"
                required
              />

              <label htmlFor="harga">Harga per Kilogram (Rp)</label>
              <input
                id="harga"
                type="number"
                min="0"
                step="any"
                value={hargaPerKg}
                onChange={(e) => setHargaPerKg(e.target.value)}
                placeholder="Contoh: 3000"
                required
              />

              <label htmlFor="status">Status Setoran</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Menunggu konfirmasi</option>
                <option value="Confirmed">Dikonfirmasi</option>
                <option value="Rejected">Ditolak</option>
              </select>

              {error && (
                <p role="alert" className="wm-no-results">
                  {error}
                </p>
              )}

              <div className="wm-modal-actions">
                <button
                  type="button"
                  className="wm-cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="wm-add-button"
                  disabled={saving || anggota.length === 0}
                >
                  {saving ? "Menyimpan..." : "Simpan Setoran"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
