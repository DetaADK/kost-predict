import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PredictionForm from "../components/prediction/PredictionForm";

const features = [
  {
    number: "01",
    title: "Jarak Lokasi",
    description:
      "Mempertimbangkan jarak kos dari kampus sebagai salah satu faktor prediksi.",
  },
  {
    number: "02",
    title: "Fasilitas AC",
    description: "Mempertimbangkan ketersediaan fasilitas pendingin ruangan.",
  },
  {
    number: "03",
    title: "Rating Kos",
    description:
      "Mempertimbangkan nilai rating sebagai indikator penilaian kos.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-20 text-center sm:py-28">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold tracking-wider text-blue-700">
              MACHINE LEARNING BASED SYSTEM
            </span>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Temukan Kos Ideal,
              <span className="block text-blue-600">
                Ketahui Estimasi Harganya.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
              Ketahui estimasi harga kos berdasarkan jarak lokasi, fasilitas,
              dan rating menggunakan teknologi Machine Learning.
            </p>

            <a
              href="#prediksi"
              className="mt-9 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-700"
            >
              Mulai Prediksi
              <span className="ml-3">→</span>
            </a>
          </div>
        </section>

        {/* Prediction */}
        <section
          id="prediksi"
          className="scroll-mt-24 mx-auto max-w-7xl px-6 py-20"
        >
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Mulai Sekarang
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Prediksi Harga Kos
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Isi informasi kos untuk mendapatkan estimasi harga.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <PredictionForm />
          </div>
        </section>

        {/* Features */}
        <section
          id="tentang"
          className="border-t border-slate-200 bg-white py-20"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Tentang Sistem
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                Bagaimana Prediksi Bekerja?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
                Sistem menggunakan beberapa parameter sebagai masukan untuk
                menghasilkan estimasi harga kos.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <span className="text-sm font-extrabold text-blue-600">
                    {feature.number}
                  </span>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
