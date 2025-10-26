import Image from "next/image"

export default function VerifiedScoreSection() {
  return (
    <section className="w-full bg-neutral-100 rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl">
      {/* Grid with 2 equal boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
        
        {/* Left Box */}
        <div className="p-8 md:p-10 lg:p-12 flex items-start bg-white rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-semibold text-[#252B37] leading-tight">
              Earn a{" "}
              <span className="text-[#F4781B]">Verified</span>{" "}
              Score.
              <br />
              Get Hired Faster.
            </h2>
            
            <p className="text-base sm:text-lg text-[#717680] leading-relaxed">
              Once you complete onboarding and pre-screening, you'll receive an 
              AI-generated scorecard. Recruiters see only verified candidates — so 
              you stand out instantly.
            </p>
          </div>
        </div>
        {/* Right Box */}
        <div className="p-8 md:p-12 lg:p-16 flex items-center justify-center bg-white lg:rounded-r-lg rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl">
          <div className="relative w-full max-w-2xl">
            <Image 
              src="/img/card.png" 
              alt="Verified score card showing Dr. Noah Liam profile"
              width={500}
              height={1000}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
