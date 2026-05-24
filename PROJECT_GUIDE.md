# PROJECT GUIDE

## Project
Aplikasi web analisis sentimen terhadap penggunaan ChatGPT dalam pembelajaran berdasarkan ulasan pengguna Google Play Store untuk mendukung SDG 4 menggunakan FastText.

## Main Rule
FastText adalah model utama untuk klasifikasi sentimen. Gemini API hanya digunakan sebagai AI Insight, bukan sebagai penentu sentimen.

## Backend
Backend menggunakan:
- Python 3.12
- Flask
- Flask-CORS
- FastText
- pandas
- nltk
- python-dotenv
- google-generativeai

Backend wajib memakai file:
- model_fasttext_chatgpt.bin
- dataset_chatgpt_clean.csv

Backend tidak boleh melakukan training ulang model.

## Frontend
Frontend menggunakan:
- React Vite
- Tailwind CSS
- shadcn/ui
- GSAP
- Three.js
- Parallax mouse movement

## Backend Endpoint
GET /health
GET /stats
POST /predict

POST /predict menerima:
{
  "text": "isi review user"
}

POST /predict mengembalikan:
{
  "success": true,
  "sentiment": "positif",
  "confidence": 0.884,
  "clean_text": "...",
  "ai_insight": "...",
  "gemini_status": "connected"
}

## Gemini
Gemini menggunakan GEMINI_API_KEY dari file .env.
Gunakan model gemini-2.5-flash.
Jika Gemini gagal, quota habis, API key kosong, atau error lain, aplikasi tetap berjalan memakai FastText lokal.

Fallback:
AI Insight sedang tidak tersedia. Analisis utama tetap berjalan menggunakan model FastText lokal.

## UI
UI harus modern, akademis, elegan, futuristik.
Gunakan dark navy, glassmorphism, blue glow, purple accent.
Jangan terlalu ramai.
Jangan gunakan emoji berlebihan.
Jangan buat login/register.