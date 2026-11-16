export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
            K
          </div>

          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Kost<span className="text-blue-600">Predict</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-blue-600">
            Beranda
          </a>

          <a
            href="#prediksi"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Prediksi
          </a>

          <a
            href="#tentang"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Tentang
          </a>
        </div>

        <a
          href="#prediksi"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Mulai Prediksi
        </a>
      </nav>
    </header>
  );
}
