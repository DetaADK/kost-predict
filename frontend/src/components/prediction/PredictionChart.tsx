// frontend/src/components/prediction/PredictionChart.tsx
// Dependensi: npm install recharts

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  price: number;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatRingkas = (value: number) =>
  value >= 1_000_000
    ? `Rp${(value / 1_000_000).toFixed(2).replace(".", ",")} jt`
    : `Rp${Math.round(value / 1000)} rb`;

export default function PredictionChart({ price }: Props) {
  if (!Number.isFinite(price) || price <= 0) return null;

  // Rentang ±10% hanya ilustrasi, bukan keluaran model.
  const data = [
    { name: "Batas bawah", harga: Math.round(price * 0.9), warna: "#bfdbfe" },
    { name: "Prediksi", harga: Math.round(price), warna: "#2563eb" },
    { name: "Batas atas", harga: Math.round(price * 1.1), warna: "#bfdbfe" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-800">Diagram Harga Prediksi</h3>
      <p className="mt-1 text-xs text-slate-500">
        Perbandingan harga prediksi dengan rentang ±10%
      </p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="25%"
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <YAxis hide domain={[0, (max: number) => max * 1.15]} />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              formatter={(value) => formatRupiah(Number(value))}
            />
            <Bar dataKey="harga" radius={[8, 8, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.warna} />
              ))}
              <LabelList
                dataKey="harga"
                position="top"
                fontSize={12}
                formatter={(value) => formatRingkas(Number(value))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
