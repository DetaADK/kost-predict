export interface PredictionInput {
  jarak_km: number;
  ac: string;
  rating: number;
}

export interface PredictionResponse {
  harga_prediksi: number;
  harga_format: string;
}
