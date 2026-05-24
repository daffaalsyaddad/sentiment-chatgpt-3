import os

import google.generativeai as genai


GEMINI_MODEL_NAME = "gemini-2.5-flash"
GEMINI_TIMEOUT_SECONDS = 18
MAX_INSIGHT_OUTPUT_TOKENS = 180
MIN_INSIGHT_LENGTH = 80

FALLBACK_RESPONSE = {
    "ai_insight": "AI Insight sedang tidak tersedia. Analisis utama tetap berjalan menggunakan model FastText lokal.",
    "gemini_status": "fallback",
}


def _build_prompt(original_text, sentiment, confidence):
    review_text = str(original_text or "").strip()
    sentiment_label = str(sentiment or "").strip().lower()
    word_count = len(review_text.split())
    short_text_note = (
        "Teks review sangat pendek; tambahkan catatan kehati-hatian bahwa konteks interpretasi terbatas."
        if word_count < 5
        else "Teks review cukup untuk dianalisis secara ringkas."
    )

    return f"""
Anda adalah asisten akademik untuk aplikasi analisis sentimen review ChatGPT dalam pembelajaran.

Aturan wajib:
- Sentimen sudah ditentukan oleh model FastText lokal. Jangan mengubah, menebak ulang, atau membandingkan label sentimen.
- Gunakan label sentimen dan confidence hanya sebagai dasar penjelasan.
- Jelaskan makna sentimen, hubungannya dengan pengalaman pembelajaran, dan relevansinya dengan SDG 4.
- Jika review terlalu pendek, sebutkan secara singkat bahwa konteks interpretasi terbatas.
- Tulis ringkas dalam bahasa Indonesia, 2 sampai 4 kalimat.
- Hindari kalimat generik seperti "Ulasan positif ini" atau "Ulasan negatif ini"; langsung jelaskan substansinya.
- Jangan memakai bullet, heading, markdown, emoji, atau daftar bernomor.

Review pengguna:
{review_text}

Hasil FastText:
- Sentimen: {sentiment_label}
- Confidence: {float(confidence):.3f}
- Catatan panjang teks: {short_text_note}

Tulis AI Insight akademis yang spesifik dan mudah dipahami.
""".strip()


def _is_valid_insight(insight):
    if not insight:
        return False

    normalized = insight.strip()
    if len(normalized) < MIN_INSIGHT_LENGTH:
        return False

    if normalized[-1] not in ".!?":
        return False

    sentence_count = sum(normalized.count(mark) for mark in ".!?")
    return 2 <= sentence_count <= 5


def generate_ai_insight(original_text, sentiment, confidence):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return FALLBACK_RESPONSE.copy()

    try:
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config={
                "temperature": 0.35,
                "top_p": 0.9,
                "max_output_tokens": MAX_INSIGHT_OUTPUT_TOKENS,
            },
        )

        prompt = _build_prompt(original_text, sentiment, confidence)

        response = model.generate_content(
            prompt,
            request_options={"timeout": GEMINI_TIMEOUT_SECONDS},
        )

        insight = getattr(response, "text", None)
        if not _is_valid_insight(insight):
            return FALLBACK_RESPONSE.copy()

        insight = insight.strip()

        return {
            "ai_insight": insight,
            "gemini_status": "connected",
        }
    except Exception:
        return FALLBACK_RESPONSE.copy()
