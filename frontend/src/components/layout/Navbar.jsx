import { BarChart3, BrainCircuit } from "lucide-react";

const navItems = [
  { label: "Beranda", href: "#hero" },
  { label: "Analisis", href: "#analyzer" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Fitur", href: "#fitur" },
];

function scrollToTarget(targetId) {
  const target = document.querySelector(targetId);

  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function Navbar() {
  function handleClick(event, href) {
    event.preventDefault();
    scrollToTarget(href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glassmorphism mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-lg px-3 py-3 shadow-[0_14px_60px_rgba(2,6,23,0.35)] sm:px-4">
        <a
          href="#hero"
          onClick={(event) => handleClick(event, "#hero")}
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 transition duration-300 group-hover:border-cyan-200/50 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.22)]">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="hidden text-sm font-semibold text-white sm:block">
            Sentiment Education
          </span>
        </a>

        <div className="no-scrollbar flex min-w-0 flex-1 justify-center overflow-x-auto">
          <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-950/45 p-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleClick(event, item.href)}
                className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium text-slate-300 transition duration-300 hover:bg-cyan-300/10 hover:text-cyan-100 sm:text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <a
          href="#dashboard"
          onClick={(event) => handleClick(event, "#dashboard")}
          className="button-shine hidden h-9 items-center rounded-lg border border-purple-300/25 bg-purple-300/10 px-3 text-xs font-semibold text-purple-100 transition duration-300 hover:border-purple-200/50 hover:bg-purple-300/15 md:inline-flex"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Live Data
        </a>
      </nav>
    </header>
  );
}

export default Navbar;
