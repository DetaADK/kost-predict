from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = ROOT / "data" / "processed" / "kos_madiun_clean.csv"
MODEL_DIR = ROOT / "machine_learning" / "models"
REPORT_DIR = ROOT / "machine_learning" / "reports"
MODEL_FILE = MODEL_DIR / "kos_price_model.joblib"
REPORT_FILE = REPORT_DIR / "model_comparison.csv"
METADATA_FILE = REPORT_DIR / "training_summary.json"

NUMERIC_FEATURES = ["jarak_km", "rating"]
CATEGORICAL_FEATURES = ["ac"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET = "harga"

BASELINE_NAME = "Baseline median"
# Model yang dipasang untuk aplikasi. Baseline hanya pembanding di laporan,
# karena baseline selalu menjawab median (1.125.000) apa pun inputnya.
# Linear Regression dipilih karena efeknya mudah dibaca: jarak jauh -> lebih murah,
# rating tinggi -> lebih mahal, tanpa peredaman koefisien seperti Ridge.
DEPLOY_MODEL_NAME = "Linear Regression"


def make_preprocessor():
    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    return ColumnTransformer([
        ("numeric", numeric_pipeline, NUMERIC_FEATURES),
        ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
    ])


def make_pipeline(regressor):
    return Pipeline([
        ("preprocessing", make_preprocessor()),
        ("regressor", regressor),
    ])


def main():
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            "Data bersih belum ada. Jalankan: "
            "python machine_learning/src/clean_data.py"
        )

    df = pd.read_csv(DATA_FILE)
    X = df[FEATURES]
    y = df[TARGET]

    if len(df) < 10:
        raise ValueError("Data terlalu sedikit untuk evaluasi awal yang bermakna.")

    candidates = {
        BASELINE_NAME: DummyRegressor(strategy="median"),
        "Linear Regression": LinearRegression(),
        "Ridge alpha=1": Ridge(alpha=1.0),
        "Ridge alpha=10": Ridge(alpha=10.0),
        "Random Forest": RandomForestRegressor(
            n_estimators=200, max_depth=3, min_samples_leaf=2,
            random_state=42
        ),
        "Extra Trees": ExtraTreesRegressor(
            n_estimators=200, max_depth=3, min_samples_leaf=2,
            random_state=42
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=50, learning_rate=0.03, max_depth=1,
            loss="huber", random_state=42
        ),
    }

    cv = LeaveOneOut()
    results = []

    for name, estimator in candidates.items():
        pipeline = make_pipeline(estimator)
        predictions = cross_val_predict(pipeline, X, y, cv=cv)
        results.append({
            "model": name,
            "MAE_ribu_rupiah": mean_absolute_error(y, predictions),
            "RMSE_ribu_rupiah": mean_squared_error(y, predictions) ** 0.5,
            "R2_LOOCV": r2_score(y, predictions),
        })

    results_df = pd.DataFrame(results).sort_values("MAE_ribu_rupiah")
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    results_df.to_csv(REPORT_FILE, index=False)

    print("\nHasil evaluasi Leave-One-Out Cross-Validation")
    print(results_df.to_string(index=False, float_format=lambda value: f"{value:.2f}"))

    best_name = DEPLOY_MODEL_NAME
    best_pipeline = make_pipeline(candidates[best_name])
    best_pipeline.fit(X, y)

    # Tampilkan pengaruh tiap fitur (ribu rupiah) agar bisa dijelaskan di laporan.
    reg = best_pipeline.named_steps["regressor"]
    scaler = best_pipeline.named_steps["preprocessing"].named_transformers_["numeric"].named_steps["scaler"]
    per_km = reg.coef_[0] / scaler.scale_[0]
    per_rating = reg.coef_[1] / scaler.scale_[1]
    print(f"Pengaruh: {per_km:.1f} ribu per +1 km | {per_rating:.1f} ribu per +1 rating")

    # Pemeriksaan: model yang dipasang harus benar-benar bereaksi pada input.
    probe = pd.DataFrame([
        {"jarak_km": 0.5, "rating": 3.0, "ac": "tidak"},
        {"jarak_km": 2.0, "rating": 4.0, "ac": "ya"},
        {"jarak_km": 5.0, "rating": 4.8, "ac": "ya"},
    ])
    probe_pred = best_pipeline.predict(probe)
    if probe_pred.max() - probe_pred.min() < 1e-6:
        raise RuntimeError("Model menghasilkan prediksi konstan; periksa data/fitur.")

    baseline_row = results_df[results_df["model"] == BASELINE_NAME].iloc[0]
    chosen_row = results_df[results_df["model"] == best_name].iloc[0]
    beats_baseline = bool(chosen_row["MAE_ribu_rupiah"] < baseline_row["MAE_ribu_rupiah"])

    artifact = {
        "pipeline": best_pipeline,
        "features": FEATURES,
        "target": TARGET,
        "target_unit": "ribu rupiah per bulan",
        "selected_model": best_name,
        "training_rows": int(len(df)),
        "loocv_mae": float(chosen_row["MAE_ribu_rupiah"]),
        "baseline_mae": float(baseline_row["MAE_ribu_rupiah"]),
        "beats_baseline": beats_baseline,
    }
    joblib.dump(artifact, MODEL_FILE)

    summary = {
        "selected_model": best_name,
        "training_rows": int(len(df)),
        "features": FEATURES,
        "target": TARGET,
        "target_unit": "ribu rupiah per bulan",
        "beats_baseline": beats_baseline,
        "evaluation": results_df.to_dict(orient="records"),
        "warning": (
            "Dataset hanya 30 baris dan fitur hampir tidak berkorelasi dengan "
            "harga. Model belum lebih akurat daripada menebak median (R2 LOOCV "
            "negatif), jadi hasil prediksi hanya perkiraan kasar."
        ),
    }
    METADATA_FILE.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\nModel dipasang: {best_name} (mengalahkan baseline: {beats_baseline})")
    print("Contoh prediksi (ribu rupiah):", [round(float(p), 1) for p in probe_pred])
    print(f"Model tersimpan: {MODEL_FILE}")
    print(f"Laporan tersimpan: {REPORT_FILE}")


if __name__ == "__main__":
    main()