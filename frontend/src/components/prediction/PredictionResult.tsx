// frontend/src/components/prediction/PredictionResult.tsx

import type {
  PredictionApiResponse,
  PredictionInput,
  PredictionResponse,
} from "../../types/prediction";

import PredictionChart from "./PredictionChart";

interface Props {
  // Bisa berupa respons mentah dari backend (dibungkus "data") atau sudah diambil isinya
  result: PredictionResponse | PredictionApiResponse;
  input: PredictionInput;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PredictionResult({ result, input }: Props) {
  const prediction: PredictionResponse =
    "data" in result ? result.data : result;

  const price = Number(prediction?.harga_prediksi);
  const priceValid = Number.isFinite(price) && price > 0;

  return (
    <div className="mt-8 space-y-6">
      {/* Harga Prediksi */}
      <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-6">
          <p className="text-sm font-medium text-blue-100">
            Estimasi Harga Kos per Bulan
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            {priceValid
              ? prediction.harga_format || formatRupiah(price)
              : "Tidak tersedia"}
          </h2>

          <p className="mt-2 text-xs text-blue-100">
            Hasil prediksi menggunakan Machine Learning.
          </p>
        </div>

        <div className="p-6">
          <h3 className="mb-4 font-bold text-slate-800">Parameter Prediksi</h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Jarak</p>
              <p className="mt-1 font-bold text-slate-800">
                {input.jarak_km} KM
              </p>
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
        </div>
      </div>

      {/* Diagram atau peringatan */}
      {priceValid ? (
        <PredictionChart price={price} />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-semibold">Harga prediksi tidak terbaca.</p>
          <p className="mt-1">Data yang diterima dari backend:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-700">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Keterangan */}
      <p className="text-xs leading-relaxed text-slate-500">
        Harga yang ditampilkan merupakan estimasi berdasarkan model Machine
        Learning, bukan harga pasti dari pemilik kos.
      </p>
    </div>
  );
}
