from pathlib import Path
import joblib
import pandas as pd

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import PredictionSerializer


# Menentukan lokasi model Machine Learning
ROOT_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    ROOT_DIR
    / "machine_learning"
    / "models"
    / "kos_price_model.joblib"
)


# Memuat model
artifact = joblib.load(MODEL_PATH)
model = artifact["pipeline"]


class PredictionView(APIView):

    def post(self, request):

        # Validasi input
        serializer = PredictionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data

        # Menyiapkan data untuk Machine Learning
        input_data = pd.DataFrame([{
            "jarak_km": data["jarak_km"],
            "ac": data["ac"],
            "rating": data["rating"],
        }])

        # Melakukan prediksi
        prediction = float(model.predict(input_data)[0])

        # Konversi dari ribuan rupiah ke rupiah
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