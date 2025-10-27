import Image from "next/image"
import { Section } from "@/components/ui/section"
import { Heading } from "@/components/ui/heading"
import { ResponsiveParagraph } from "@/components/ui/paragraph"

export default function VerifiedScoreSection() {
  return (
    <Section padding={false} backgroundColor="bg-neutral-100" className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4 lg:gap-6 xl:gap-8">
      {/* Grid with 2 equal boxes */}
        
        {/* Left Box */}
        <Section className="flex items-start w-full">
          <div className="space-y-4">
            <Heading as="h2" size="md" className="text-[#252B37] leading-tight">
              Earn a{" "}
              <span className="text-[#F4781B]">Verified</span>{" "}
              Score.
              <br />
              Get Hired Faster.
            </Heading>
            
            <ResponsiveParagraph size="base" className="text-[#717680] leading-relaxed">
              Once you complete onboarding and pre-screening, you&apos;ll receive an 
              AI-generated scorecard. Recruiters see only verified candidates — so 
              you stand out instantly.
            </ResponsiveParagraph>
          </div>
        </Section>
        {/* Right Box */}
        <Section padding={false} className="flex overflow-hidden items-center justify-end">
          <div className="relative  mx-auto max-w-2xl">
            <Image 
              src="/img/card.png" 
              alt="Verified score card showing Dr. Noah Liam profile"
              width={500}
              height={1000}
              className="object-contain"
              priority
            />
          </div>
        </Section>
      
    </Section>
  )
}
