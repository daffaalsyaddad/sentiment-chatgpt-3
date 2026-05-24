import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export async function getStats() {
  try {
    const response = await api.get("/stats");
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Gagal mengambil statistik dataset.",
      { cause: error },
    );
  }
}

export async function predictSentiment(text) {
  try {
    const response = await api.post("/predict", { text });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Gagal memproses analisis sentimen.",
      { cause: error },
    );
  }
}
