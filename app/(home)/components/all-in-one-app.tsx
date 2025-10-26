'use client'

import Image from "next/image"

export default function AllInOneSection() {
  const features = [
    {
      screen: "/img/screens/screen1.png",
      title: "Resume & Certificate Upload",
      description: "Securely store all your professional documents in one place to create a comprehensive, standout profile"
    },
    {
      screen: "/img/screens/screen2.png",
      title: "Document Verification",
      description: "Our system verifies your credentials, giving you a badge of trust that makes your application a priority for top employers."
    },
    {
      screen: "/img/screens/screen3.png",
      title: "Map View",
      description: "Visually discover job openings in your area. See commute times and find shifts close to home.."
    },
    {
      screen: "/img/screens/screen4.png",
      title: "Job Marketplace",
      description: "Filter through full-time, contract, and freelance roles to find the perfect opportunity that fits your schedule and skills."
    },
    {
      screen: "/img/screens/screen5.png",
      title: "Wallet & Payment History",
      description: "Track your earnings and manage payments directly within the app. Get paid reliably with full transparency.."
    }
  ]; 
return (
    <section className="w-full bg-white rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl p-4 md:p-8 lg:p-16">
      {/* Header */}
      <div className=" mb-12">
        <h2 className="text-5xl font-medium text-[#252B37] mb-4">
          Your{" "}
          <span className="text-[#F4781B]">All-in-One</span>{" "}
          Healthcare career App
        </h2>
        <p className="text-base font-normal text-[#717680] max-w-3xl">
          From building a verified profile to managing your payments, everything you need is right here
          </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex flex-col items-start text-left p-6 border-b border-[#E9EAEB] pb-6"
          >
            {/* Screen Image */}
              <div className="relative w-40 h-80 sm:w-48 sm:h-96">
                <Image 
                  src={feature.screen}
                  alt={feature.title}
                  fill
                  className="object-contain rounded-xl"
                />
              </div>
            {/* Title */}
            <h3 className="text-xl font-medium text-[#252B37] mb-3">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-base font-normal text-[#717680] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}