import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { predictSentiment } from "@/services/api";

const sentimentStyles = {
  positif: {
    card: "border-emerald-300/20 bg-emerald-300/10",
    text: "text-emerald-200",
    badge: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    bar: "from-emerald-300 to-cyan-300",
  },
  negatif: {
    card: "border-rose-300/20 bg-rose-300/10",
    text: "text-rose-200",
    badge: "border-rose-300/30 bg-rose-300/10 text-rose-100",
    bar: "from-rose-300 to-red-400",
  },
  netral: {
    card: "border-amber-300/20 bg-amber-300/10",
    text: "text-amber-200",
    badge: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    bar: "from-amber-300 to-slate-300",
  },
};

const SAMPLE_REVIEW = "ChatGPT membantu saya memahami materi kuliah dengan cepat";

function formatConfidence(confidence) {
  const numericConfidence = Number(confidence);

  if (Number.isNaN(numericConfidence)) {
    return 0;
  }

  const percent = numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence;
  return Math.min(Math.max(percent, 0), 100);
}

function Toast({ toast }) {
  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute right-4 top-4 z-20 flex max-w-[calc(100%-2rem)] items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
        isSuccess
          ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-50"
          : "border-rose-300/25 bg-rose-300/10 text-rose-50"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="leading-5">{toast.message}</span>
    </div>
  );
}

function PreviewAnalyzer({ className = "", style }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [typedInsight, setTypedInsight] = useState("");
  const resultRef = useRef(null);
  const toastTimerRef = useRef(null);
  const confidenceFrameRef = useRef(null);

  const sentimentKey = result?.sentiment?.toLowerCase() || "netral";
  const activeStyle = sentimentStyles[sentimentKey] || sentimentStyles.netral;
  const confidencePercent = useMemo(
    () => formatConfidence(result?.confidence),
    [result?.confidence],
  );
  const isGeminiConnected = result?.gemini_status === "connected";
  const insightStatus =
    isGeminiConnected ? "Gemini Connected" : "Offline Insight Mode";
  const insightBadgeClass = isGeminiConnected
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
    : "border-slate-500/30 bg-slate-800/70 text-slate-200";

  useEffect(() => {
    if (!result || !resultRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        resultRef.current,
        { autoAlpha: 0, y: 18, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
      );
    }, resultRef);

    return () => context.revert();
  }, [result]);

  useEffect(() => {
    window.cancelAnimationFrame(confidenceFrameRef.current);

    if (!result) {
      return undefined;
    }

    const finalValue = confidencePercent;
    const start = performance.now();
    const duration = 850;

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedConfidence(finalValue * eased);

      if (progress < 1) {
        confidenceFrameRef.current = window.requestAnimationFrame(animate);
      }
    }

    confidenceFrameRef.current = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(confidenceFrameRef.current);
  }, [confidencePercent, result]);

  useEffect(() => {
    if (!result?.ai_insight) {
      return undefined;
    }

    const insight = result.ai_insight;
    let cursor = 0;

    const interval = window.setInterval(() => {
      cursor = Math.min(cursor + 3, insight.length);
      setTypedInsight(insight.slice(0, cursor));

      if (cursor >= insight.length) {
        window.clearInterval(interval);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [result?.ai_insight]);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
      window.cancelAnimationFrame(confidenceFrameRef.current);
    };
  }, []);

  function showToast(message, type = "success") {
    window.clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  function handleUseSample() {
    setText(SAMPLE_REVIEW);
    setError("");
    showToast("Contoh review dimasukkan.");
  }

  function handleReset() {
    setText("");
    setResult(null);
    setError("");
    setAnimatedConfidence(0);
    setTypedInsight("");
    showToast("Analisis direset.");
  }

  async function handleCopyResult() {
    if (!result) {
      showToast("Belum ada hasil untuk disalin.", "error");
      return;
    }

    const output = [
      `Sentiment: ${result.sentiment}`,
      `Confidence: ${confidencePercent.toFixed(1)}%`,
      `Clean Text: ${result.clean_text || "-"}`,
      `AI Insight: ${result.ai_insight || "-"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(output);
      showToast("Hasil analisis berhasil disalin.");
    } catch {
      showToast("Gagal menyalin hasil analisis.", "error");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim()) {
      setResult(null);
      setError("Input review tidak boleh kosong.");
      showToast("Input review tidak boleh kosong.", "error");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setAnimatedConfidence(0);
    setTypedInsight("");

    try {
      const response = await predictSentiment(text.trim());
      setResult(response);
      showToast("Analisis berhasil diproses.");
    } catch (requestError) {
      const message =
        requestError?.message ||
        "Backend tidak merespons. Pastikan Flask berjalan di http://127.0.0.1:5000.";

      setResult(null);
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`preview-card hover-card glassmorphism glow relative rounded-lg p-4 sm:p-6 ${className}`}
      style={style}
    >
      <Toast toast={toast} />

      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-200/75">
            Live Analyzer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Analisis Sentimen Review
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="review-input" className="sr-only">
          Input review pengguna
        </label>
        <textarea
          id="review-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Tulis ulasan pengguna, misalnya: ChatGPT membantu saya memahami materi dengan lebih cepat dan jelas."
          className="focus-ring min-h-32 w-full resize-y rounded-lg border border-slate-700/70 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200 placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        />

        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xs leading-5 text-slate-400">
            FastText menentukan sentimen. AI Insight hanya menjelaskan hasil.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="button-shine h-12 w-full justify-center rounded-lg border-cyan-300/30 bg-cyan-300 px-4 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.22)] hover:bg-cyan-200 disabled:opacity-70"
            >
              {isLoading ? "Menganalisis..." : "Analisis Sentimen"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseSample}
              disabled={isLoading}
              className="focus-ring h-12 w-full justify-center rounded-lg border-cyan-300/20 bg-slate-950/40 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50"
            >
              Gunakan Contoh
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="focus-ring h-12 w-full justify-center rounded-lg border-slate-600/70 bg-slate-950/40 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-800/70 hover:text-white"
            >
              Reset Analisis
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyResult}
              disabled={!result || isLoading}
              className="focus-ring h-12 w-full justify-center rounded-lg border-purple-300/25 bg-purple-300/10 px-4 text-sm font-semibold text-purple-100 hover:bg-purple-300/15 hover:text-purple-50 disabled:opacity-50"
            >
              Copy Hasil
            </Button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="mt-5 rounded-lg border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-rose-50">Analisis belum dapat diproses.</p>
              <p className="mt-1 text-rose-100/90">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/75">
              FastText Processing
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-purple-300" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Mengirim review ke backend Flask dan menunggu hasil sentimen
              dari model FastText lokal.
            </p>
          </div>

          <div className="rounded-lg border border-purple-300/20 bg-purple-300/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-purple-200/75">
                AI Insight
              </p>
              <span className="inline-flex items-center rounded-full border border-purple-300/25 bg-slate-950/50 px-3 py-1 text-xs font-medium text-purple-100">
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Preparing Insight
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Gemini akan menjelaskan hasil FastText setelah prediksi selesai.
              Jika layanan AI tidak tersedia, analisis utama tetap berjalan.
            </p>
          </div>
        </div>
      ) : result ? (
        <div ref={resultRef} className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
          <div className={`rounded-lg border p-4 ${activeStyle.card}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/75">
                Sentimen
              </p>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${activeStyle.badge}`}
              >
                {result.sentiment}
              </span>
            </div>
            <p className={`mt-3 text-3xl font-semibold capitalize ${activeStyle.text}`}>
              {result.sentiment}
            </p>
            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${activeStyle.bar}`}
                style={{ width: `${animatedConfidence}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Confidence {animatedConfidence.toFixed(1)}%
            </p>

            <div className="mt-4 rounded-lg border border-slate-700/70 bg-slate-950/55 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Clean Text
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-slate-300">
                {result.clean_text || "-"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-purple-300/20 bg-purple-300/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-purple-200/75">
                  AI Insight
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Interpretasi Pembelajaran
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${insightBadgeClass}`}>
                {insightStatus}
              </span>
            </div>
            <p className="insight-copy mt-4 rounded-lg border border-slate-700/60 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
              {typedInsight}
              {typedInsight.length < (result.ai_insight || "").length ? (
                <span className="typing-cursor" aria-hidden="true" />
              ) : null}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Insight ini menjelaskan hasil FastText, bukan menentukan sentimen
              baru.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-slate-700/70 bg-slate-950/45 p-4 text-sm leading-6 text-slate-400">
          Masukkan review pengguna untuk melihat sentimen, confidence, hasil
          preprocessing, dan insight dari backend Flask.
        </div>
      )}
    </div>
  );
}

export default PreviewAnalyzer;
