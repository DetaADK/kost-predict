from django.urls import path
from .views import PredictionView, ExplanationView

urlpatterns = [
    path(
        "prediksi/harga/",
        PredictionView.as_view(),
        name="prediksi-harga"
    ),
    path(
        "prediksi/penjelasan/",
        ExplanationView.as_view(),
        name="prediksi-penjelasan"
    ),
]