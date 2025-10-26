'use client'

import Image from 'next/image'

export default function HireWithConfidence() {
  return (
    <section className="w-full rounded-3xl bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header - Title and Description */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-normal text-[#252B37] mb-6">
            Hire with <span className="text-[#F4781B] font-semibold">Confidence</span>
          </h2>
          <p className="text-[#717680] text-base lg:text-lg leading-relaxed max-w-3xl">
            You'll only see candidates who are pre-screened, verified, and AI-rated — saving time and ensuring compliance.
          </p>
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
      </div>
    </section>
  )
}
