import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Activity, AlertCircle, Database, Smile, Meh, Frown } from "lucide-react";

import SentimentChart from "@/components/charts/SentimentChart";
import { getStats } from "@/services/api";

const DEFAULT_STATS = {
  total: 0,
  positif: 0,
  negatif: 0,
  netral: 0,
};

function AnimatedCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const displayValueRef = useRef(0);

  useEffect(() => {
    let frameId;
    const from = displayValueRef.current;
    const to = Number(value || 0);
    const start = performance.now();
    const duration = 900;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = Math.round(from + (to - from) * eased);
      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return displayValue.toLocaleString("id-ID");
}

const statCards = [
  {
    key: "total",
    label: "Total Review",
    icon: Database,
    tone: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  },
  {
    key: "positif",
    label: "Positif",
    icon: Smile,
    tone: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  },
  {
    key: "negatif",
    label: "Negatif",
    icon: Frown,
    tone: "border-rose-300/20 bg-rose-300/10 text-rose-200",
  },
  {
    key: "netral",
    label: "Netral",
    icon: Meh,
    tone: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  },
];

function DashboardSection() {
  const sectionRef = useRef(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getStats();

        if (!isMounted) {
          return;
        }

        setStats({
          total: Number(response?.total || 0),
          positif: Number(response?.positif || 0),
          negatif: Number(response?.negatif || 0),
          netral: Number(response?.netral || 0),
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError?.message ||
            "Statistik belum dapat diambil. Pastikan backend Flask berjalan.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.set(".dashboard-reveal", { autoAlpha: 0, y: 34 });
    }, section);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        context.add(() => {
          gsap.to(".dashboard-reveal", {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
          });
        });
        observer.disconnect();
      },
      { threshold: 0.22 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      context.revert();
    };
  }, [isLoading, error]);

  return (
    <section
      id="dashboard"
      data-section-reveal
      ref={sectionRef}
      className="relative z-10 scroll-mt-28 px-5 py-16 sm:px-8 lg:px-14 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="dashboard-reveal flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200/75">
              Live Statistics Dashboard
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
              Distribusi ulasan dari dataset analisis sentimen.
            </h2>
          </div>
          <div className="inline-flex w-fit items-center rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-purple-100">
            <Activity className="mr-2 h-4 w-4" />
            Backend Live
          </div>
        </div>

        {isLoading ? (
          <div className="dashboard-reveal mt-10 grid gap-5 md:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.key}
                className="glassmorphism h-32 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : error ? (
          <div className="dashboard-reveal mt-10 rounded-lg border border-rose-300/20 bg-rose-300/10 p-5 text-sm leading-6 text-rose-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="dashboard-reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article key={card.key} className="hover-card glassmorphism rounded-lg p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-slate-300">
                        {card.label}
                      </p>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${card.tone}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-5 text-4xl font-semibold text-white">
                      <AnimatedCounter value={stats[card.key]} />
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="dashboard-reveal mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="hover-card glassmorphism rounded-lg p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Sentiment Distribution
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Komposisi sentimen dataset
                    </h3>
                  </div>
                </div>
                <SentimentChart stats={stats} />
              </div>

              <div className="hover-card glassmorphism rounded-lg p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Academic Reading
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Statistik sebagai dasar interpretasi pembelajaran.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Data live dari backend membantu membaca kecenderungan ulasan
                  pengguna terhadap pemanfaatan ChatGPT dalam aktivitas belajar.
                  Visualisasi ini tetap menampilkan hasil agregat dari endpoint
                  statistik, tanpa melakukan klasifikasi baru di frontend.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["FastText", "Google Play", "SDG 4"].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-slate-700/70 bg-slate-950/45 px-4 py-3 text-sm font-medium text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default DashboardSection;
