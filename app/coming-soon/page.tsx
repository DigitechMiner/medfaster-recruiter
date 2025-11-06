import { Metadata } from "next";
import Image from "next/image";

import { Footer } from "@/components/global/footer";

import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/global/navbar";
import { Heading } from "@/components/custom/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/custom/paragraph";
import { CustomButton } from "@/components/custom/custom-button";
import LandingHeader from "@/components/global/landing-header";

export const metadata: Metadata = {
  title: "Coming Soon | MedFaster",
  description: "Something exciting is coming to MedFaster. Stay tuned for updates!",
};

export default function ComingSoonPage() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col" suppressHydrationWarning={true}>
      <LandingHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-24 lg:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/img/features/coming-soon.svg"
              alt="Coming Soon"
              width={300}
              height={250}
              className="w-64 h-56 object-contain"
              quality={100}
              priority
            />
          </div>

          <Heading as="h1" size="lg" className="text-[#252B37]">
            Stay Tuned
          </Heading>

          <ResponsiveParagraph size="base" className="text-[#717680] leading-relaxed">
            Get the latest updates on the MedFaster platform, exclusive invites,
            and early access for healthcare professionals and recruiters in
            Canada.
          </ResponsiveParagraph>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-12 mb-6">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 max-w-md px-4 py-3 rounded-lg border border-gray-300 text-[#252B37] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4781B]"
            />
            <CustomButton
              rightIcon={ChevronRight}
              size="md"
              className="bg-[#F4781B] text-white hover:bg-orange-600"
              iconClassName="text-white"
              iconContainerClassName="bg-white/20"
            >
              Notify Me
            </CustomButton>
          </div>

          <Paragraph size="sm" className="text-[#717680]">
            Sign up to get early launch notification of our launch date!
          </Paragraph>
        </div>
      </main>

      <section className="w-full bg-gray-50 py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <Heading as="h2" size="md" className="text-[#252B37] mb-4">
                Hiring Insights & Top Candidate{" "}
                <span className="text-[#F4781B]">Alerts</span>
              </Heading>
              <Paragraph size="sm" className="text-[#717680] leading-relaxed">
                Get curated hiring insights and top candidate alerts delivered
                to your inbox.
              </Paragraph>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-[#252B37] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4781B]"
              />
              <CustomButton
                rightIcon={ChevronRight}
                size="md"
                className="bg-[#F4781B] text-white hover:bg-orange-600"
                iconClassName="text-white"
                iconContainerClassName="bg-white/20"
              >
                Subscribe
              </CustomButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
