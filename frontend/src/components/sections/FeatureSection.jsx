import { BarChart3, BrainCircuit, Sparkles } from "lucide-react";

const features = [
  {
    title: "FastText Sentiment Engine",
    description:
      "Model lokal menjadi sumber utama klasifikasi sentimen sehingga analisis tetap konsisten dengan aturan penelitian.",
    icon: BrainCircuit,
    tone: "cyan",
  },
  {
    title: "Gemini AI Insight",
    description:
      "AI Insight hanya menjelaskan hasil FastText secara akademis, relevan dengan pembelajaran dan SDG 4.",
    icon: Sparkles,
    tone: "purple",
  },
  {
    title: "Interactive Education Dashboard",
    description:
      "Fondasi dashboard disiapkan untuk membaca ringkasan, distribusi, dan pola pengalaman pengguna secara visual.",
    icon: BarChart3,
    tone: "blue",
  },
];

const toneClass = {
  cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  purple: "border-purple-300/20 bg-purple-300/10 text-purple-200",
  blue: "border-blue-300/20 bg-blue-300/10 text-blue-200",
};

function FeatureSection() {
  return (
    <section
      id="fitur"
      data-section-reveal
      className="relative z-10 scroll-mt-28 px-5 pb-20 pt-10 sm:px-8 lg:px-14 lg:pb-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-purple-200/75">
            Core Capabilities
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
            Fondasi analisis yang ringkas, akademis, dan siap dikembangkan.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="hover-card glassmorphism rounded-lg p-6"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border ${toneClass[feature.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
