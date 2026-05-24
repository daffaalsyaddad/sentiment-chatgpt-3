# Analisis Sentimen ChatGPT untuk Pembelajaran

Aplikasi web analisis sentimen terhadap penggunaan ChatGPT dalam pembelajaran berdasarkan ulasan pengguna Google Play Store. Sistem menggunakan model FastText lokal sebagai classifier utama dan Gemini API hanya sebagai AI Insight untuk membantu menjelaskan hasil dalam konteks pembelajaran dan SDG 4.

## Teknologi Backend

- Python 3.12
- Flask
- Flask-CORS
- FastText
- pandas
- NLTK
- python-dotenv
- google-generativeai
- gunicorn

## Teknologi Frontend

- React Vite
- JavaScript
- Tailwind CSS
- shadcn/ui
- GSAP
- Three.js
- Recharts
- Framer Motion

## Menjalankan Backend Lokal

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend berjalan di:

```text
http://127.0.0.1:5000
```

File yang wajib tersedia di folder `backend`:

- `model_fasttext_chatgpt.bin`
- `dataset_chatgpt_clean.csv`

## Menjalankan Frontend Lokal

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

## Environment Variable

Backend (`backend/.env`):

```env
GEMINI_API_KEY=isi_api_key_gemini
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Frontend (`frontend/.env`):

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

## Endpoint API

```text
GET  /health
GET  /stats
POST /predict
```

Contoh request:

```json
{
  "text": "ChatGPT membantu saya memahami materi kuliah dengan cepat"
}
```

Contoh response:

```json
{
  "success": true,
  "sentiment": "positif",
  "confidence": 0.884,
  "clean_text": "...",
  "ai_insight": "...",
  "gemini_status": "connected"
}
```

## Deploy Backend ke Render

1. Buat service baru di Render dengan tipe Web Service.
2. Pilih root directory `backend`.
3. Gunakan Python 3.12.
4. Build command:

```bash
pip install -r requirements.txt
```

5. Start command:

```bash
gunicorn app:app
```

6. Tambahkan environment variable:

```env
GEMINI_API_KEY=isi_api_key_gemini
CORS_ORIGINS=https://domain-frontend-vercel-anda.vercel.app
```

Render juga dapat membaca `Procfile`:

```text
web: gunicorn app:app
```

## Deploy Frontend ke Vercel

1. Import project ke Vercel.
2. Pilih root directory `frontend`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Tambahkan environment variable:

```env
VITE_API_BASE_URL=https://domain-backend-render-anda.onrender.com
```

6. Redeploy frontend setelah environment variable disimpan.

## Catatan Penting

- FastText adalah classifier utama untuk menentukan sentimen dan confidence.
- Gemini API hanya digunakan untuk membuat AI Insight berdasarkan hasil FastText.
- Frontend tidak melakukan klasifikasi sentimen.
- Backend tidak melakukan training ulang model saat aplikasi berjalan.
- API key tidak boleh di-hardcode di kode backend maupun frontend.
