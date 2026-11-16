import type {
  PredictionInput,
  PredictionResponse,
} from "../../types/prediction";

interface Props {
  result: PredictionResponse;
  input: PredictionInput;
}

export default function PredictionResult({ result, input }: Props) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
      <div className="bg-blue-600 px-6 py-5">
        <p className="text-sm font-medium text-blue-100">
          Estimasi harga kos per bulan
        </p>

        <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          {result.harga_format}
        </h2>
      </div>

      <div className="p-6">
        <h3 className="mb-4 font-bold text-slate-800">
          Detail parameter prediksi
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Jarak</p>
            <p className="mt-1 font-bold text-slate-800">{input.jarak_km} KM</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">AC</p>
            <p className="mt-1 font-bold text-slate-800">
              {input.ac === "ya" ? "Tersedia" : "Tidak"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Rating</p>
            <p className="mt-1 font-bold text-slate-800">{input.rating}/5</p>
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          Hasil ini merupakan estimasi berdasarkan model Machine Learning, bukan
          harga pasti dari pemilik kos.
        </p>
      </div>
    </div>
  );
}
