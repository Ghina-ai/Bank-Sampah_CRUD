CREATE TABLE IF NOT EXISTS anggota (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    no_telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS setoran (
    id SERIAL PRIMARY KEY,
    anggota_id INTEGER NOT NULL REFERENCES anggota(id)
        ON DELETE CASCADE,
    jenis_sampah VARCHAR(100) NOT NULL,
    berat_kg DECIMAL(10, 2) NOT NULL,
    harga_per_kg DECIMAL(12, 2) NOT NULL,
    total_harga DECIMAL(12, 2)
        GENERATED ALWAYS AS (berat_kg * harga_per_kg) STORED,
    tanggal_setor TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
