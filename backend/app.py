import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from gemini_service import generate_ai_insight
from sentiment_core import get_dataset_stats, is_model_loaded, load_fasttext_model, predict_sentiment


load_dotenv()

app = Flask(__name__)

cors_origins = os.environ.get("CORS_ORIGINS")
allowed_origins = (
    [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
    if cors_origins
    else [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
)

CORS(app, resources={r"/*": {"origins": allowed_origins}})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": is_model_loaded(),
    })


@app.route("/stats", methods=["GET"])
def stats():
    return jsonify(get_dataset_stats())


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Request harus berupa JSON.",
            }), 400

        payload = request.get_json(silent=True)
        if not isinstance(payload, dict) or "text" not in payload:
            return jsonify({
                "success": False,
                "message": "Field text wajib diisi.",
            }), 400

        text = payload.get("text")
        if text is None or not str(text).strip():
            return jsonify({
                "success": False,
                "message": "Input review tidak boleh kosong.",
            }), 400

        prediction = predict_sentiment(text)
        if "error" in prediction:
            if prediction["error"].startswith("Teks tidak memiliki"):
                return jsonify({
                    "success": False,
                    "message": prediction["error"],
                }), 400

            return jsonify({
                "success": False,
                "message": "Terjadi kesalahan pada server.",
                "error": prediction["error"][:200],
            }), 500

        insight = generate_ai_insight(
            text,
            prediction["sentiment"],
            prediction["confidence"],
        )

        return jsonify({
            "success": True,
            "sentiment": prediction["sentiment"],
            "confidence": prediction["confidence"],
            "clean_text": prediction["clean_text"],
            "ai_insight": insight["ai_insight"],
            "gemini_status": insight["gemini_status"],
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": "Terjadi kesalahan pada server.",
            "error": str(exc)[:200],
        }), 500


if __name__ == "__main__":
    try:
        load_fasttext_model()
    except Exception as exc:
        print(f"Peringatan: {exc}")

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
