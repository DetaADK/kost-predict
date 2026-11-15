from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
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

    # Baseline: selalu menebak median harga pada data training.
    candidates = {
        "Baseline median": DummyRegressor(strategy="median"),
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
    predictions_by_model = {}

    for name, estimator in candidates.items():
        pipeline = make_pipeline(estimator)
        predictions = cross_val_predict(pipeline, X, y, cv=cv)
        predictions_by_model[name] = predictions

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

    # Pilih berdasarkan MAE LOOCV. Dengan data kecil, ini hanya seleksi awal,
    # bukan bukti bahwa model akan akurat pada data dari luar dataset.
    best_name = results_df.iloc[0]["model"]
    best_estimator = candidates[best_name]
    best_pipeline = make_pipeline(best_estimator)
    best_pipeline.fit(X, y)

    artifact = {
        "pipeline": best_pipeline,
        "features": FEATURES,
        "target": TARGET,
        "target_unit": "ribu rupiah per bulan",
        "selected_model": best_name,
        "training_rows": int(len(df)),
    }
    joblib.dump(artifact, MODEL_FILE)

    summary = {
        "selected_model": best_name,
        "training_rows": int(len(df)),
        "features": FEATURES,
        "target": TARGET,
        "target_unit": "ribu rupiah per bulan",
        "evaluation": results_df.to_dict(orient="records"),
        "warning": (
            "Dataset hanya 30 baris. Skor LOOCV tidak menjamin performa "
            "pada data kos baru; lakukan validasi eksternal setelah data "
            "tambahan tersedia."
        ),
    }
    METADATA_FILE.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\nModel terpilih: {best_name}")
    print(f"Model tersimpan: {MODEL_FILE}")
    print(f"Laporan tersimpan: {REPORT_FILE}")

if __name__ == "__main__":
    main()
