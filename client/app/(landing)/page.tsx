// app/(landing)/page.tsx
import { Suspense } from "react";
import dynamic from "next/dynamic";

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import { FeaturesSection } from "./components/feature";
import { CtaSection } from "./components/cta";
import { Footer } from "./components/footer";

// Use dynamic imports for heavier components
const IntegrationsSection = dynamic(
  () =>
    import("./components/integration").then((mod) => ({
      default: mod.IntegrationsSection,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 w-full bg-gray-50" />,
  }
);

const TestimonialsSection = dynamic(
  () =>
    import("./components/testimonial").then((mod) => ({
      default: mod.TestimonialsSection,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 w-full bg-gray-50" />,
  }
);

const FaqSection = dynamic(
  () => import("./components/faq").then((mod) => ({ default: mod.FaqSection })),
  {
    ssr: true,
    loading: () => <div className="h-96 w-full bg-gray-50" />,
  }
);

export default function LandingPage() {
  return (
    <main>
      {/* Always visible components */}
      <Navbar />
      <Hero />

      {/* Features section will be below the initial viewport */}
      <FeaturesSection />

      {/* Less critical content - load after initial view */}
      <Suspense fallback={<div className="h-96 w-full bg-gray-50" />}>
        <IntegrationsSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 w-full bg-gray-50" />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 w-full bg-gray-50" />}>
        <FaqSection />
      </Suspense>

      <CtaSection />
      <Footer />
    </main>
  );
}
