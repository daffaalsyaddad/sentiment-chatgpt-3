import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "FastText Model",
    value: "Local NLP",
    description: "Klasifikasi sentimen utama tanpa menentukan ulang via AI.",
  },
  {
    label: "Google Play Reviews",
    value: "User Voice",
    description: "Membaca pola ulasan pengguna ChatGPT untuk pembelajaran.",
  },
  {
    label: "SDG 4 Education",
    value: "Academic Lens",
    description: "Insight diarahkan pada kualitas pendidikan digital.",
  },
];

function HeroSection() {
  const rootRef = useRef(null);

  function scrollToSection(sectionId) {
    const target = document.querySelector(sectionId);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.set(".hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-card", {
        autoAlpha: 0,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.9 },
      });

      timeline
        .fromTo(
          ".hero-badge",
          { y: 16, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1 },
        )
        .fromTo(
          ".hero-title",
          { y: 42 },
          { autoAlpha: 1, y: 0, duration: 1 },
          "-=0.5",
        )
        .fromTo(
          ".hero-subtitle",
          { y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          "-=0.45",
        )
        .fromTo(
          ".hero-actions",
          { y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          "-=0.35",
        )
        .fromTo(
          ".hero-card",
          { y: 28, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.12,
            duration: 0.75,
          },
          "-=0.25",
        );
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative z-10 flex min-h-screen scroll-mt-24 items-center px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-14"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-5xl">
          <div className="hero-badge inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.16)]">
            AI Sentiment Research Platform
          </div>

          <h1 className="hero-title gradient-text mt-6 max-w-5xl text-4xl font-semibold leading-[1.06] sm:text-6xl lg:text-7xl">
            Analisis Sentimen ChatGPT untuk Pembelajaran
          </h1>

          <p className="hero-subtitle mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Klasifikasi ulasan pengguna Google Play Store menggunakan FastText
            dengan AI Insight untuk mendukung SDG 4.
          </p>

          <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => scrollToSection("#analyzer")}
              className="button-shine h-12 rounded-lg border-cyan-300/30 bg-cyan-300 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.28)] hover:bg-cyan-200"
            >
              Mulai Analisis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("#dashboard")}
              className="button-shine h-12 rounded-lg border-purple-300/30 bg-slate-950/40 px-6 text-sm font-semibold text-white hover:bg-purple-300/10 hover:text-white"
            >
              Lihat Dashboard
              <BarChart3 className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="hero-card hover-card glassmorphism rounded-lg p-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
