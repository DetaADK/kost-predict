# Prediksi Harga Kos Madiun

Proyek pembelajaran untuk memprediksi harga kos menggunakan Python dan Machine Learning.
Rencana aplikasi:
- Machine Learning: Python + scikit-learn
- Backend: Django + Django REST Framework
- Frontend: React
- Database: tidak wajib untuk versi awal (MVP)

## Kondisi dataset saat ini
Dataset awal berisi 30 baris dan 5 kolom. `harga` menggunakan satuan ribuan rupiah:
- 600 berarti Rp600.000/bulan
- 1.250 berarti Rp1.250.000/bulan

Fitur awal yang dipakai: `jarak_km`, `ac`, `rating`.
Kolom `nama` tidak dipakai sebagai fitur prediksi karena merupakan identitas kos.

## 1. Persiapan
Disarankan menggunakan Python 3.11 atau 3.12 dan virtual environment.

Linux / Ubuntu:
```bash
cd kost-predict
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 2. Bersihkan dan validasi data
```bash
python machine_learning/src/clean_data.py
```
Script memvalidasi kolom, tipe data, kategori AC, nilai kosong, dan duplikasi.
Hasilnya disimpan ke `data/processed/kos_madiun_clean.csv`.

## 3. Latih dan evaluasi model
```bash
python machine_learning/src/train_model.py
```
Model dibandingkan menggunakan Leave-One-Out Cross-Validation (LOOCV).
Script juga membandingkan model dengan baseline median. Hasil evaluasi disimpan ke
`machine_learning/reports/model_comparison.csv`, dan model terpilih disimpan ke
`machine_learning/models/kos_price_model.joblib`.

**Penting:** 30 baris sangat sedikit. LOOCV memanfaatkan data secara efisien untuk
evaluasi awal, tetapi skor tetap tidak stabil. Memilih model berdasarkan skor pada
dataset kecil ini belum membuktikan bahwa model akan akurat pada kos baru.
Jangan mengklaim akurasi tinggi sebelum menguji pada data kos baru yang representatif.

## 4. Coba prediksi
Setelah model berhasil dibuat:
```bash
python machine_learning/src/predict.py
```

Input harus berada dalam rentang dan definisi yang sesuai dengan data pelatihan.
Prediksi bukan penawaran harga atau jaminan harga pasar.

## Struktur folder
```text
kost-predict/
├── data/
│   ├── raw/                 # Dataset asli, jangan diedit langsung
│   └── processed/           # Dataset hasil validasi/pembersihan
├── machine_learning/
│   ├── src/                 # Kode preprocessing, training, prediksi
│   ├── models/              # Model .joblib hasil training
│   └── reports/             # Hasil evaluasi
├── backend/                 # Akan diisi Django REST Framework
├── frontend/                # Akan diisi React
├── requirements.txt
└── README.md
```

## Rencana tahap berikutnya
1. Memastikan definisi setiap kolom dan satuan harga.
2. Menambah data kos yang benar-benar dikumpulkan.
3. Mengevaluasi model dengan data baru yang tidak dipakai saat training.
4. Membuat API Django REST Framework.
5. Membuat antarmuka React dan menghubungkannya ke API.
