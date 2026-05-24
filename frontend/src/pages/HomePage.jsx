import { useEffect } from "react";
import gsap from "gsap";

import ParticleBackground from "@/components/effects/ParticleBackground";
import MainLayout from "@/components/layout/MainLayout";
import DashboardSection from "@/components/sections/DashboardSection";
import FeatureSection from "@/components/sections/FeatureSection";
import HeroSection from "@/components/sections/HeroSection";
import PreviewAnalyzer from "@/components/sections/PreviewAnalyzer";

function HomePage() {
  useEffect(() => {
    const sections = gsap.utils.toArray("[data-section-reveal]");
    const observers = [];

    sections.forEach((section) => {
      gsap.set(section, { autoAlpha: 0, y: 42 });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          gsap.to(section, {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
          });
          observer.disconnect();
        },
        { threshold: 0.16 },
      );

      observer.observe(section);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <MainLayout>
      <ParticleBackground />
      <HeroSection />
      <section
        id="analyzer"
        data-section-reveal
        className="relative z-10 scroll-mt-28 px-5 py-16 sm:px-8 lg:px-14 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200/75">
              Live Sentiment Analyzer
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
              Uji review pengguna secara langsung dari model FastText lokal.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
              Frontend hanya mengirim teks ke backend Flask dan menampilkan
              response asli. Sentimen tetap ditentukan oleh model FastText,
              sedangkan Gemini hanya memberi insight pendukung.
            </p>
          </div>

          <PreviewAnalyzer className="mx-auto w-full max-w-2xl" />
        </div>
      </section>
      <DashboardSection />
      <FeatureSection />
    </MainLayout>
  );
}

export default HomePage;
