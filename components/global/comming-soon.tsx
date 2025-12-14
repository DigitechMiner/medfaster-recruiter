import Image from "next/image";
import { Heading } from "@/components/custom/heading";
import { ResponsiveParagraph, Paragraph } from "@/components/custom/paragraph";
import { CustomButton } from "@/components/custom/custom-button";
import { ChevronRight } from "lucide-react";
import { Section } from "@/components/custom/section";

export function ComingSoon() {
  return (
    <div className="m-4 md:m-8 lg:m-16 ">
      <Section className="!bg-neutral-100 flex-1 flex flex-col items-center justify-center">
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

          <ResponsiveParagraph
            size="base"
            className="text-[#717680] leading-relaxed"
          >
            Get the latest updates on the MedFaster platform, exclusive
            invites, and early access for healthcare professionals and
            recruiters in Canada.
          </ResponsiveParagraph>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-12 mb-6">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 max-w-md px-4 py-3 border border-gray-300 text-[#252B37] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4781B] bg-white !rounded-full"
            />
            <CustomButton
              rightIcon={ChevronRight}
              size="md"
            >
              Notify Me
            </CustomButton>
          </div>

          <Paragraph size="sm" className="text-[#717680]">
            Sign up to get early launch notification of our launch date!
          </Paragraph>
        </div>
      </Section>
    </div>
  );
}
