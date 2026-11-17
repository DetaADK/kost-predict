from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]   # folder kost-predict

sumber = ROOT / "data" / "processed" / "kos_madiun_clean.csv"
tujuan = ROOT / "frontend" / "src" / "data" / "dataKos.json"

df = pd.read_csv(sumber)

hasil = df[["jarak_km", "harga"]].dropna().copy()
hasil.columns = ["jarak", "harga"]

# Dataset memakai satuan ribuan rupiah -> ubah ke rupiah penuh
hasil["harga"] = (hasil["harga"] * 1000).round().astype(int)

tujuan.parent.mkdir(parents=True, exist_ok=True)
hasil.to_json(tujuan, orient="records")
print(f"Tersimpan {len(hasil)} baris ke {tujuan}")