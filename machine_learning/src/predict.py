from pathlib import Path
import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
MODEL_FILE = ROOT / "machine_learning" / "models" / "kos_price_model.joblib"

def rupiah_from_thousand(value):
    amount = round(float(value) * 1000)
    return "Rp" + f"{amount:,.0f}".replace(",", ".")

def main():
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            "Model belum tersedia. Jalankan train_model.py terlebih dahulu."
        )

    artifact = joblib.load(MODEL_FILE)
    model = artifact["pipeline"]

    print("=== Prediksi Harga Kos ===")
    jarak = float(input("Jarak dari tujuan (km), contoh 1.5: ").replace(",", "."))
    ac = input("Apakah kos memiliki AC? (ya/tidak): ").strip().lower()
    rating = float(input("Rating kos (0-5), contoh 4.2: ").replace(",", "."))

    if jarak < 0:
        raise ValueError("Jarak tidak boleh negatif.")
    if ac not in {"ya", "tidak"}:
        raise ValueError("Masukkan AC sebagai 'ya' atau 'tidak'.")
    if not 0 <= rating <= 5:
        raise ValueError("Rating harus berada pada rentang 0 sampai 5.")

    sample = pd.DataFrame([{
        "jarak_km": jarak,
        "rating": rating,
        "ac": ac,
    }])

    prediction = float(model.predict(sample)[0])
    print("\nPerkiraan harga:", rupiah_from_thousand(prediction), "per bulan")
    print("Catatan: ini estimasi model dari dataset kecil, bukan harga pasti.")

if __name__ == "__main__":
    main()
