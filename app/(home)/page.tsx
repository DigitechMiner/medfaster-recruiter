import Header from "@/components/global/header"
import HeroSection from "./components/hero-section"
import CompanyLogos from "./components/company-logos"
import GetHiredSection from "./components/get-hired-section"
import AIHelpsSection from "./components/ai-helps-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100 p-2 md:p-4 lg:p-6 xl:p-8 gap-2 md:gap-4 lg:gap-6 xl:gap-8 flex flex-col">
      <Header />
      <HeroSection />
      <CompanyLogos />
      <GetHiredSection />
      <AIHelpsSection />
    </div>
  );
}