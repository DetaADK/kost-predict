from django.urls import path
from .views import PredictionView

urlpatterns = [
    path(
        "prediksi/harga/",
        PredictionView.as_view(),
        name="prediksi-harga"
    ),
]