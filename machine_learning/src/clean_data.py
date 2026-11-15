from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW_FILE = ROOT / "data" / "raw" / "kos_madiun.csv"
OUTPUT_FILE = ROOT / "data" / "processed" / "kos_madiun_clean.csv"

REQUIRED_COLUMNS = ["nama", "jarak_km", "harga", "ac", "rating"]

def normalize_ac(value):
    """Samakan variasi penulisan kategori AC."""
    value = str(value).strip().lower()
    mapping = {
        "ya": "ya", "yes": "ya", "true": "ya", "1": "ya",
        "tidak": "tidak", "no": "tidak", "false": "tidak", "0": "tidak",
    }
    return mapping.get(value)

def main():
    if not RAW_FILE.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {RAW_FILE}")

    df = pd.read_csv(RAW_FILE)
    print(f"Ukuran awal: {df.shape[0]} baris, {df.shape[1]} kolom")

    missing_columns = sorted(set(REQUIRED_COLUMNS) - set(df.columns))
    if missing_columns:
        raise ValueError(f"Kolom wajib tidak ditemukan: {missing_columns}")

    # Ambil kolom yang memang didefinisikan dalam proyek.
    df = df[REQUIRED_COLUMNS].copy()

    # Rapikan teks.
    df["nama"] = df["nama"].astype("string").str.strip()
    df["ac"] = df["ac"].map(normalize_ac)

    # Pastikan kolom numerik benar-benar numerik.
    for column in ["jarak_km", "harga", "rating"]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    # Laporkan masalah, jangan diam-diam mengarang atau mengisi nilai.
    if df.isna().any().any():
        print("\nNilai kosong/tidak valid:")
        print(df.isna().sum())
        raise ValueError(
            "Ada nilai kosong atau kategori AC tidak dikenal. "
            "Periksa dataset asli sebelum melanjutkan."
        )

    if (df["jarak_km"] < 0).any():
        raise ValueError("Jarak tidak boleh negatif.")
    if (df["harga"] <= 0).any():
        raise ValueError("Harga harus lebih besar dari 0.")
    if not df["rating"].between(0, 5).all():
        raise ValueError("Rating harus berada pada rentang 0 sampai 5.")

    duplicate_count = int(df.duplicated().sum())
    print(f"Baris duplikat identik: {duplicate_count}")
    if duplicate_count:
        df = df.drop_duplicates().copy()

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)

    print(f"\nData bersih tersimpan: {OUTPUT_FILE}")
    print(f"Ukuran akhir: {df.shape[0]} baris")
    print("\nRingkasan:")
    print(df[["jarak_km", "harga", "rating"]].describe())
    print("\nJumlah kategori AC:")
    print(df["ac"].value_counts())

if __name__ == "__main__":
    main()
