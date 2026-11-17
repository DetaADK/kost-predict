import { useEffect, useState } from "react";
import { explainPrediction } from "../../services/predictionService";
import type { PredictionInput } from "../../types/prediction";

interface Props {
  price: number;
  input: PredictionInput;
}

export default function PredictionExplanation({ price, input }: Props) {
  const { jarak_km, ac, rating } = input;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;

    explainPrediction({ jarak_km, ac, rating }, price)
      .then((result) => {
        if (!batal) {
          setText(result);
        }
      })
      .catch((err: unknown) => {
        if (!batal) {
          setError(
            err instanceof Error ? err.message : "Gagal mengambil penjelasan.",
          );
        }
      })
      .finally(() => {
        if (!batal) {
          setLoading(false);
        }
      });

    return () => {
      batal = true;
    };
  }, [jarak_km, ac, rating, price]);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
      <h3 className="text-sm font-bold text-indigo-900">Penjelasan Grafik</h3>

      {loading && (
        <p className="mt-2 animate-pulse text-sm text-indigo-700">
          Sedang membuat penjelasan menggunakan AI...
        </p>
      )}

      {!loading && text && (
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{text}</p>
      )}

      {!loading && error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-semibold text-red-700">
            Gagal mengambil penjelasan AI
          </p>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
