import { useEffect } from "react";
import { SiteHeader } from "./components/layout/SiteHeader";
import { SiteFooter } from "./components/layout/SiteFooter";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { ToolsFail } from "./sections/ToolsFail";
import { ProductPreview } from "./sections/ProductPreview";
import { HowItWorks } from "./sections/HowItWorks";
import { FinalCTA } from "./sections/FinalCTA";
import { EarlyAccessModal, openEarlyAccess } from "./components/early-access/EarlyAccessModal";
import { LeadsDashboard } from "./admin/LeadsDashboard";
import { useOverflowAudit } from "./hooks/useOverflowAudit";

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/$/, "") === "/admin/leads";
  useOverflowAudit(isAdmin);
  useEffect(() => {
    document.title = "MIRA — Know what people actually understand";
    document.documentElement.lang = "en";
  }, []);

  if (isAdmin) return <LeadsDashboard />;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">Skip to content</a>
      <SiteHeader />
      <main id="content">
        <Hero />
        <Problem />
        <ProductPreview />
        <HowItWorks />
        <ToolsFail />
        <FinalCTA />
      </main>
      <SiteFooter />
      <a className="mobile-sticky-cta" href="#early-access" onClick={(event) => { event.preventDefault(); openEarlyAccess("mobile_sticky", event.currentTarget); }}>Try MIRA free</a>
      <EarlyAccessModal />
    </div>
  );
}
