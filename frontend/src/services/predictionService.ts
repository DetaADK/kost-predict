import type { PredictionInput, PredictionResponse } from "../types/prediction";

const API_URL = "http://127.0.0.1:8000/api/prediksi/harga/";

export async function predictPrice(
  input: PredictionInput,
): Promise<PredictionResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.detail || "Prediksi gagal dilakukan.");
  }

  return data as PredictionResponse;
}
