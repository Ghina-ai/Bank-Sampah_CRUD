"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

type Setoran = {
  id: number;
  jenis_sampah: string;
  berat: number | string;
  harga_per_kg: number | string;
  total_harga: number | string;
  status: string;
  nama_anggota: string;
};

type EditSetoranModalProps = {
  setoran: Setoran;
  onClose: () => void;
  onSave: (data: {
    id: number;
    jenis_sampah: string;
    berat: number;
    harga_per_kg: number;
    status: string;
  }) => Promise<void>;
  menyimpan?: boolean;
};

export default function EditSetoranModal({
  setoran,
  onClose,
  onSave,
  menyimpan = false,
}: EditSetoranModalProps) {
  const [jenisSampah, setJenisSampah] = useState("");
  const [berat, setBerat] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    setJenisSampah(setoran.jenis_sampah ?? "");
    setBerat(String(setoran.berat ?? ""));
    setHargaPerKg(String(setoran.harga_per_kg ?? ""));
    setStatus(setoran.status?.toLowerCase() ?? "pending");
  }, [setoran]);

  const totalHarga = (Number(berat) || 0) * (Number(hargaPerKg) || 0);

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!jenisSampah.trim()) {
      alert("Jenis sampah harus diisi.");
      return;
    }

    if (Number(berat) <= 0 || Number(hargaPerKg) < 0) {
      alert("Berat harus lebih dari 0 dan harga tidak boleh negatif.");
      return;
    }

    await onSave({
      id: setoran.id,
      jenis_sampah: jenisSampah,
      berat: Number(berat),
      harga_per_kg: Number(hargaPerKg),
      status,
    });
  };

  return (
    <div className="edit-setoran-overlay" onClick={onClose}>
      <div
        className="edit-setoran-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-setoran-heading">
          <div>
            <Icon icon="mdi:pencil-outline" />
          </div>

          <div>
            <h2>Edit Setoran Sampah</h2>
            <p>Ubah informasi setoran sesuai kebutuhan.</p>
          </div>

          <button
            type="button"
            className="edit-setoran-close"
            onClick={onClose}
            aria-label="Tutup"
            disabled={menyimpan}
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="edit-setoran-body">
            <div className="edit-field">
              <label htmlFor="edit-nama-anggota">Nama Anggota</label>
              <input
                id="edit-nama-anggota"
                type="text"
                value={setoran.nama_anggota ?? ""}
                readOnly
              />
              <small>Nama anggota tidak dapat diubah.</small>
            </div>

            <div className="edit-field">
            <label htmlFor="edit-jenis-sampah">Jenis Sampah</label>
            <input
                id="edit-jenis-sampah"
                type="text"
                placeholder="Masukkan jenis sampah"
                value={jenisSampah}
                onChange={(e) => setJenisSampah(e.target.value)}
                required
            />
            </div>

            <div className="edit-field-row">
              <div className="edit-field">
                <label htmlFor="edit-berat">Berat Sampah (kg)</label>
                <input
                  id="edit-berat"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Contoh: 2.5"
                  value={berat}
                  onChange={(e) => setBerat(e.target.value)}
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="edit-harga">Harga per Kilogram (Rp)</label>
                <input
                  id="edit-harga"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Contoh: 3000"
                  value={hargaPerKg}
                  onChange={(e) => setHargaPerKg(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="edit-field">
              <label htmlFor="edit-status">Status Setoran</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="pending">Menunggu Konfirmasi</option>
                <option value="confirmed">Terkonfirmasi</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="edit-setoran-actions">
            <button
              type="button"
              className="edit-btn-cancel"
              onClick={onClose}
              disabled={menyimpan}
            >
              Batal
            </button>

            <button
              type="submit"
              className="edit-btn-save"
              disabled={menyimpan}
            >
              {menyimpan ? (
                <>
                  <Icon icon="mdi:loading" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}