from pathlib import Path
import os
import json
import joblib
import pandas as pd
import numpy as np
import urllib.error
import urllib.request

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import PredictionSerializer


# ==========================================
# KONFIGURASI PATH
# ==========================================

ML_DIR = Path(__file__).resolve().parent / "ml"

MODEL_PATH = ML_DIR / "kos_price_model.joblib"
DATA_PATH = ML_DIR / "kos_madiun_clean.csv"


# ==========================================
# MEMUAT MODEL MACHINE LEARNING
# ==========================================

artifact = joblib.load(MODEL_PATH)
model = artifact["pipeline"]


# ==========================================
# PREDIKSI HARGA KOS
# ==========================================

class PredictionView(APIView):

    def post(self, request):

        serializer = PredictionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data

        input_data = pd.DataFrame([{
            "jarak_km": data["jarak_km"],
            "ac": data["ac"],
            "rating": data["rating"],
        }])

        prediction = float(model.predict(input_data)[0])

        harga_rupiah = round(prediction * 1000)

        return Response({
            "success": True,
            "message": "Prediksi berhasil",
            "data": {
                "harga_prediksi": harga_rupiah,
                "harga_format": (
                    "Rp" + f"{harga_rupiah:,.0f}".replace(",", ".")
                ),
            }
        })


# ==========================================
# GARIS REGRESI DATASET
# ==========================================

dataset = pd.read_csv(DATA_PATH).dropna(
    subset=["jarak_km", "harga"]
)

SLOPE, INTERCEPT = np.polyfit(
    dataset["jarak_km"].to_numpy(),
    dataset["harga"].to_numpy() * 1000,
    1,
)


# ==========================================
# KONFIGURASI GROQ
# ==========================================

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)


def format_rupiah(value):
    return "Rp" + f"{round(value):,.0f}".replace(",", ".")


# ==========================================
# PENJELASAN HASIL PREDIKSI DENGAN GROQ
# ==========================================

class ExplanationView(APIView):

    def post(self, request):

        # 1. Validasi input
        try:
            jarak = float(request.data["jarak_km"])
            harga = float(request.data["harga_prediksi"])
            rating = float(request.data["rating"])
            ac = str(request.data["ac"])

        except (KeyError, TypeError, ValueError):

            return Response(
                {"error": "Data tidak lengkap atau tidak valid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Validasi API Key
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:

            print("ERROR: GROQ_API_KEY tidak ditemukan.")

            return Response(
                {
                    "error": "GROQ_API_KEY tidak ditemukan. Periksa file .env."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. Menghitung garis regresi
        harga_tren = SLOPE * jarak + INTERCEPT

        if harga_tren <= 0:

            return Response(
                {"error": "Jarak di luar jangkauan dataset."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Menghitung selisih harga
        selisih = (harga - harga_tren) / harga_tren * 100

        arah = "di atas" if selisih >= 0 else "di bawah"

        # 5. Membuat prompt
        prompt = (
            "Kamu adalah asisten analisis data harga kos di Madiun. "
            "Jelaskan hasil scatter plot berdasarkan data yang diberikan. "
            "Gunakan bahasa Indonesia yang sederhana dan mudah dipahami.\n\n"

            "Buat TEPAT 4 kalimat dengan ketentuan:\n"
            "1. Kalimat pertama menjelaskan harga hasil prediksi dan jarak kos.\n"
            "2. Kalimat kedua menjelaskan posisi titik merah terhadap garis regresi "
            "dan apakah harganya di atas atau di bawah tren.\n"
            "3. Kalimat ketiga menjelaskan perbandingan hasil prediksi dengan "
            "sebaran 30 data kos.\n"
            "4. Kalimat keempat menjelaskan kemungkinan pengaruh fasilitas AC "
            "dan rating terhadap harga.\n\n"

            "Jangan menggunakan poin, judul, atau format Markdown. "
            "Jangan mengarang data atau angka. "
            "Berikan penjelasan yang alami dan tidak berulang.\n\n"

            f"Data prediksi:\n"
            f"- Harga prediksi: {format_rupiah(harga)}\n"
            f"- Jarak ke kampus: {jarak} km\n"
            f"- Fasilitas AC: {ac}\n"
            f"- Rating: {rating}/5\n"
            f"- Rata-rata garis regresi: {format_rupiah(harga_tren)}\n"
            f"- Selisih terhadap garis regresi: {abs(selisih):.1f}% {arah}\n"
            f"- Jumlah data scatter plot: {len(dataset)} kos.\n"
        )

        # 6. Payload Groq
        payload = {
            "model": GROQ_MODEL,
        
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        
            "temperature": 0.4,
        
            # Memperbesar batas token jawaban
            "max_completion_tokens": 1024,
        
            # Mengurangi penggunaan token reasoning
            "reasoning_effort": "low",
        
            # Tidak menyertakan reasoning dalam respons
            "include_reasoning": False,
        }

        # 7. Membuat request
        req = urllib.request.Request(
            GROQ_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "kost-predict/1.0",
            },
            method="POST"
        )

        # 8. Mengirim request ke Groq
        try:

            with urllib.request.urlopen(req, timeout=30) as resp:
                hasil = json.loads(resp.read().decode("utf-8"))

            # Mengambil hasil respons Groq
            choice = hasil["choices"][0]

            teks = choice["message"]["content"]

            # Menampilkan informasi respons di terminal Django
            print("GROQ FINISH REASON:", choice.get("finish_reason"))
            print("GROQ RESPONSE:", teks)

            # Memastikan respons tidak kosong
            if not teks or not teks.strip():
                raise ValueError("Respons Groq kosong.")

            # Mengirim penjelasan ke frontend
            return Response({
                "penjelasan": teks.strip()
            })

        except urllib.error.HTTPError as e:

            detail = e.read().decode(
                "utf-8",
                errors="replace"
            )

            print("GROQ HTTP ERROR:", e.code)
            print("DETAIL:", detail)

            return Response(
                {
                    "error": f"Groq API error ({e.code})",
                    "detail": detail
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        except urllib.error.URLError as e:

            print("GROQ CONNECTION ERROR:", repr(e))

            return Response(
                {
                    "error": "Tidak dapat terhubung ke server Groq."
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        except (KeyError, IndexError, ValueError, TypeError) as e:

            print("GROQ RESPONSE ERROR:", repr(e))

            return Response(
                {
                    "error": "Format respons Groq tidak valid."
                },
                status=status.HTTP_502_BAD_GATEWAY
            )