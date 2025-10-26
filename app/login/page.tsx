import { Footer } from "./components/footer";
import Header from "./components/header";
import HeroSection from "./components/hero-section";
import CompanyLogos from "../(home)/components/company-logos";
import HiredSection from "./components/hiring";
import OneDashboard from "./components/one-dashboard";
import BookADemo from "./components/book-a-demo";
import DataDrivenHiring from "./components/data-driven";
import HireWithConfidence from "./components/hire-with-confidence";
import TestimonialsSlider from "./components/testimonial";
import StartHiring from "./components/start-hiring";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100 p-2 md:p-4 lg:p-6 xl:p-8 gap-2 md:gap-4 lg:gap-6 xl:gap-8 flex flex-col">
      <Header />
      <HeroSection />
      <CompanyLogos />
      <HiredSection />
      <OneDashboard />
      <BookADemo />
      <DataDrivenHiring />
      <HireWithConfidence />
      <TestimonialsSlider />
      <StartHiring />
      <Footer />
    </div>
  )
};