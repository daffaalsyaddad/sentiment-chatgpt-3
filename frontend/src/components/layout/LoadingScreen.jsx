import { BrainCircuit } from "lucide-react";

function LoadingScreen({ isVisible }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_48px_rgba(34,211,238,0.24)]">
          <BrainCircuit className="h-8 w-8" />
          <span className="absolute inset-0 rounded-lg border border-cyan-200/20 loading-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100">
            Loading Research Interface
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Preparing live analyzer and dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
