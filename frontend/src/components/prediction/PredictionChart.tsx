// frontend/src/components/prediction/PredictionChart.tsx
// Dependensi: npm install recharts

import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TitikKos {
  jarak: number;
  harga: number;
}

interface Props {
  price: number;
  jarak: number;
  dataKos: TitikKos[];
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatRingkas = (value: number) =>
  value >= 1_000_000
    ? `Rp${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`
    : `Rp${Math.round(value / 1000)} rb`;

// Regresi linier dari dataset: harga = a + b * jarak
function hitungRegresi(points: TitikKos[]) {
  const n = points.length;
  if (n < 2) return null;

  const sumX = points.reduce((s, p) => s + p.jarak, 0);
  const sumY = points.reduce((s, p) => s + p.harga, 0);
  const sumXY = points.reduce((s, p) => s + p.jarak * p.harga, 0);
  const sumXX = points.reduce((s, p) => s + p.jarak * p.jarak, 0);

  const penyebut = n * sumXX - sumX * sumX;
  if (penyebut === 0) return null;

  const b = (n * sumXY - sumX * sumY) / penyebut;
  const a = (sumY - b * sumX) / n;
  return { a, b };
}

export default function PredictionChart({ price, jarak, dataKos }: Props) {
  const valid =
    Number.isFinite(price) &&
    price > 0 &&
    Number.isFinite(jarak) &&
    jarak >= 0 &&
    dataKos.length > 0;

  const regresi = useMemo(() => hitungRegresi(dataKos), [dataKos]);

  const garisTren = useMemo(() => {
    if (!regresi) return [];
    const xs = dataKos.map((p) => p.jarak);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    return [
      { jarak: xMin, harga: Math.round(regresi.a + regresi.b * xMin) },
      { jarak: xMax, harga: Math.round(regresi.a + regresi.b * xMax) },
    ];
  }, [regresi, dataKos]);

  if (!valid) return null;

  // Perbandingan prediksi dengan garis tren pada jarak yang sama
  const hargaTren = regresi ? regresi.a + regresi.b * jarak : null;
  const selisihPersen =
    hargaTren && hargaTren > 0 ? ((price - hargaTren) / hargaTren) * 100 : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-800">Sebaran Harga Kos</h3>
      <p className="mt-1 text-xs text-slate-500">
        Posisi hasil prediksi dibandingkan dengan {dataKos.length} data kos pada
        dataset
      </p>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="jarak"
              name="Jarak"
              unit=" km"
              domain={[0, "dataMax"]}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              fontSize={12}
              label={{
                value: "Jarak (km)",
                position: "insideBottom",
                offset: -4,
                fontSize: 12,
                fill: "#64748b",
              }}
              height={44}
            />
            <YAxis
              type="number"
              dataKey="harga"
              name="Harga"
              domain={[
                (min: number) => Math.floor((min * 0.9) / 50_000) * 50_000,
                (max: number) => Math.ceil((max * 1.1) / 50_000) * 50_000,
              ]}
              tickFormatter={formatRingkas}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={64}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name) =>
                name === "Jarak"
                  ? `${Number(value)} km`
                  : formatRupiah(Number(value))
              }
            />

            {/* Titik-titik kos dari dataset */}
            <Scatter
              name="Data kos"
              data={dataKos}
              fill="#93c5fd"
              fillOpacity={0.7}
              isAnimationActive={false}
            />

            {/* Garis regresi dari dataset */}
            <Scatter
              name="Tren"
              data={garisTren}
              line={{ stroke: "#2563eb", strokeWidth: 2 }}
              shape={() => <g />}
              tooltipType="none"
              isAnimationActive={false}
            />

            {/* Titik hasil prediksi */}
            <ReferenceDot
              x={jarak}
              y={price}
              r={9}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={3}
              ifOverflow="extendDomain"
              label={{
                value: "Prediksi",
                position: "top",
                fill: "#ef4444",
                fontSize: 12,
                fontWeight: 700,
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-300" />
          Data kos
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0 w-5 border-t-2 border-blue-600" />
          Garis regresi dataset
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Hasil prediksi
        </span>
      </div>

      {selisihPersen !== null && hargaTren !== null && (
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Pada jarak {jarak} km, rata-rata dataset sekitar{" "}
          <span className="font-semibold">{formatRupiah(hargaTren)}</span>.
          Prediksi{" "}
          <span className="font-semibold">
            {Math.abs(selisihPersen).toFixed(1).replace(".", ",")}%{" "}
            {selisihPersen >= 0 ? "di atas" : "di bawah"}
          </span>{" "}
          garis tren.
        </p>
      )}
    </div>
  );
}
