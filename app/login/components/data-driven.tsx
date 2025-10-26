'use client'

export default function DataDrivenHiring() {
  return (
    <section className="w-full rounded-3xl bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left Content */}
          <div className="flex-1 max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-normal text-[#252B37] mb-6">
              Make <span className="text-[#F4781B] font-semibold">Data-Driven</span> Hiring Decisions
            </h2>
            <p className="text-[#717680] text-base lg:text-lg leading-relaxed">
              Get complete visibility into your recruitment performance from time-to-hire to candidate quality. 
              AI insights help improve efficiency and reduce cost-per-hire.
            </p>
          </div>

          {/* Right Button */}
          <div className="flex-shrink-0">
            <button className="bg-[#F4781B] text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-[#E06A15] transition-all duration-300 hover:shadow-lg hover:scale-105">
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
