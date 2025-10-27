'use client'

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

export default function DataDrivenHiring() {
  return (
    <Section>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Content */}
        <div className="flex-1 max-w-3xl">
          <Heading className="text-[#252B37] mb-6">
            Make <span className="text-[#F4781B] font-semibold">Data-Driven</span> Hiring Decisions
          </Heading>
          <Paragraph className="text-[#717680] leading-relaxed">
            Get complete visibility into your recruitment performance from time-to-hire to candidate quality. 
            AI insights help improve efficiency and reduce cost-per-hire.
          </Paragraph>
        </div>

        {/* Right Button */}
        <div className="flex-shrink-0">
          <button className="bg-[#F4781B] text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-[#E06A15] transition-all duration-300 hover:shadow-lg hover:scale-105">
            Book Demo
          </button>
        </div>
      </div>
    </Section>
  )
}
