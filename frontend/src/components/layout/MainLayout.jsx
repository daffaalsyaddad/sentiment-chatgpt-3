import { useEffect, useState } from "react";

import Footer from "@/components/layout/Footer";
import LoadingScreen from "@/components/layout/LoadingScreen";
import Navbar from "@/components/layout/Navbar";

function MainLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 850);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;
