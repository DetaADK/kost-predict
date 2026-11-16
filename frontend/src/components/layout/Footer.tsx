export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <h2 className="text-lg font-extrabold text-slate-900">
          Kost<span className="text-blue-600">Predict</span>
        </h2>

        <p className="text-center text-xs text-slate-500">
          © 2026 KostPredict. Sistem Prediksi Harga Kos Berbasis Machine
          Learning.
        </p>
      </div>
    </footer>
  );
}
