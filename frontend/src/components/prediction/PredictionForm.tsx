import { useState } from "react";

import { predictPrice } from "../../services/predictionService";

import type {
  PredictionInput,
  PredictionResponse,
} from "../../types/prediction";

import PredictionResult from "./PredictionResult";

export default function PredictionForm() {
  const [jarak, setJarak] = useState("");
  const [ac, setAc] = useState("ya");
  const [rating, setRating] = useState("");

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);
    setLastInput(null);

    try {
      const input: PredictionInput = {
        jarak_km: Number(jarak),
        ac,
        rating: Number(rating),
      };

      const response = await predictPrice(input);

      setResult(response);
      setLastInput(input);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat melakukan prediksi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Formulir Prediksi
        </span>

        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
          Prediksi Harga Kos
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Lengkapi informasi berikut untuk mengetahui estimasi harga kos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Jarak */}
        <div>
          <label
            htmlFor="jarak"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Jarak dari kampus
          </label>

          <div className="relative">
            <input
              id="jarak"
              type="number"
              min="0"
              step="0.1"
              required
              placeholder="Contoh: 2.5"
              value={jarak}
              onChange={(event) => setJarak(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              KM
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Masukkan jarak lokasi kos dari kampus dalam kilometer.
          </p>
        </div>

        {/* AC */}
        <div>
          <label
            htmlFor="ac"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Fasilitas AC
          </label>

          <select
            id="ac"
            value={ac}
            onChange={(event) => setAc(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ya">Tersedia AC</option>
            <option value="tidak">Tidak tersedia AC</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label
            htmlFor="rating"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Rating Kos
          </label>

          <div className="relative">
            <input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              required
              placeholder="Contoh: 4.5"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              / 5
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Rating menggunakan skala 0 sampai 5.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? "Sedang memproses..." : "Prediksi Harga Kos"}
        </button>
      </form>

      {result && lastInput && (
        <PredictionResult result={result} input={lastInput} />
      )}
    </div>
  );
}
