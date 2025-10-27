'use client'

import Image from 'next/image'
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

export default function HireWithConfidence() {
  return (
    <Section>
      {/* Header - Title and Description */}
      <div className="mb-12 lg:mb-16">
        <Heading className="text-[#252B37] mb-6">
          Hire with <span className="text-[#F4781B] font-semibold">Confidence</span>
        </Heading>
        <Paragraph className="text-[#717680] leading-relaxed max-w-3xl">
          You'll only see candidates who are pre-screened, verified, and AI-rated — saving time and ensuring compliance.
        </Paragraph>
      </div>

      {/* Main Content Image */}
      <div className="w-full">
        <Image
          src="/img/confidence.png"
          alt="Candidate verification and confidence scoring"
          width={1200}
          height={600}
          className="w-full h-auto rounded-2xl"
        />
      </div>
    </Section>
  )
}
