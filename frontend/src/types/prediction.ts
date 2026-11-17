// frontend/src/types/prediction.ts

export interface PredictionInput {
  jarak_km: number;
  ac: string;
  rating: number;
}

export interface PredictionResponse {
  harga_prediksi: number;
  harga_format: string;
}

// Bentuk respons asli dari backend (hasil dibungkus di dalam "data")
export interface PredictionApiResponse {
  success: boolean;
  message: string;
  data: PredictionResponse;
}
