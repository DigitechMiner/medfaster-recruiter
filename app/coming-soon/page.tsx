import { Metadata } from "next";
import LandingHeader from "@/components/global/landing-header";
import { LandingFooter } from "@/components/global/landing-footer";
import { ComingSoon } from "@/components/global/comming-soon";

export const metadata: Metadata = {
  title: "Coming Soon | MedFaster",
  description: "Something exciting is coming to MedFaster. Stay tuned for updates!",
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-neutral-100 p-2 md:p-4 lg:p-6 xl:p-8 gap-2 md:gap-4 lg:gap-6 xl:gap-8 flex flex-col">
    <LandingHeader>
      <ComingSoon />
    </LandingHeader>
    <LandingFooter />
  </div>
  );
}
