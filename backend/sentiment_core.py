import re
import string
from pathlib import Path

import nltk
import pandas as pd
from nltk.corpus import stopwords

try:
    import fasttext
except Exception as exc:
    fasttext = None
    _FASTTEXT_IMPORT_ERROR = exc
else:
    _FASTTEXT_IMPORT_ERROR = None


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model_fasttext_chatgpt.bin"
DATASET_PATH = BASE_DIR / "dataset_chatgpt_clean.csv"

_fasttext_model = None
_indonesian_stopwords = None


def _load_indonesian_stopwords():
    global _indonesian_stopwords

    if _indonesian_stopwords is not None:
        return _indonesian_stopwords

    negation_words = {
        "tidak", "bukan", "belum", "jangan", "kurang",
        "ga", "gak", "nggak", "enggak", "tak"
    }

    try:
        stop_words = set(stopwords.words("indonesian"))
    except LookupError:
        try:
            nltk.download("stopwords", quiet=True)
            stop_words = set(stopwords.words("indonesian"))
        except Exception:
            stop_words = set()
    except Exception:
        stop_words = set()

    _indonesian_stopwords = stop_words - negation_words

    return _indonesian_stopwords


def clean_text(text):
    if text is None:
        return ""

    cleaned = str(text).lower()
    cleaned = re.sub(r"https?://\S+|www\.\S+", " ", cleaned)
    cleaned = re.sub(r"[@#]\w+", " ", cleaned)
    cleaned = re.sub(r"\d+", " ", cleaned)
    cleaned = cleaned.translate(str.maketrans("", "", string.punctuation))
    cleaned = re.sub(r"[^a-zA-Z\s]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    stop_words = _load_indonesian_stopwords()
    tokens = [word for word in cleaned.split() if word not in stop_words]

    return " ".join(tokens)


def load_fasttext_model():
    global _fasttext_model

    if _fasttext_model is not None:
        return _fasttext_model

    if fasttext is None:
        raise RuntimeError(f"FastText tidak dapat diimport: {_FASTTEXT_IMPORT_ERROR}")

    if not MODEL_PATH.exists():
        raise FileNotFoundError("File model_fasttext_chatgpt.bin tidak ditemukan di folder backend.")

    try:
        _fasttext_model = fasttext.load_model(str(MODEL_PATH))
    except Exception as exc:
        raise RuntimeError(f"Gagal memuat model FastText: {exc}") from exc

    return _fasttext_model


def is_model_loaded():
    return _fasttext_model is not None


def predict_sentiment(text):
    if text is None or not str(text).strip():
        return {"error": "Input review tidak boleh kosong."}

    cleaned_text = clean_text(text)
    if not cleaned_text:
        return {"error": "Teks tidak memiliki kata yang dapat dianalisis setelah preprocessing."}

    try:
        model = load_fasttext_model()
    except Exception as exc:
        return {"error": str(exc)}

    try:
        labels, probabilities = model.predict(cleaned_text)
    except Exception as exc:
        return {"error": f"Prediksi FastText gagal: {exc}"}

    try:
        label = labels[0] if labels else ""
        if isinstance(label, bytes):
            label = label.decode("utf-8", errors="ignore")

        sentiment = str(label).replace("__label__", "").strip().lower()
        confidence = float(probabilities[0]) if len(probabilities) > 0 else 0.0
    except Exception as exc:
        return {"error": f"Output prediksi FastText tidak valid: {exc}"}

    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "clean_text": cleaned_text,
    }


def get_dataset_stats():
    empty_stats = {
        "total": 0,
        "positif": 0,
        "negatif": 0,
        "netral": 0,
    }

    try:
        if not DATASET_PATH.exists():
            return empty_stats

        dataset = pd.read_csv(DATASET_PATH)
        if "sentiment" not in dataset.columns:
            return empty_stats

        sentiment_counts = dataset["sentiment"].astype(str).str.lower().str.strip().value_counts()

        return {
            "total": int(len(dataset)),
            "positif": int(sentiment_counts.get("positif", 0)),
            "negatif": int(sentiment_counts.get("negatif", 0)),
            "netral": int(sentiment_counts.get("netral", 0)),
        }
    except Exception:
        return empty_stats
