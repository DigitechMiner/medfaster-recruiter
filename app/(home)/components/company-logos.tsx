"use client";

import Image from "next/image";
import { Section } from "@/components/ui/section";

export default function CompanyLogos() {
  const logos = [
    { src: "/img/company/logo1.png", alt: "Canadian Health" },
    { src: "/img/company/logo2.png", alt: "Canadian Specialist Hospital" },
    { src: "/img/company/logo3.png", alt: "Medical Canada" },
    { src: "/img/company/logo4.png", alt: "Canadian Red Cross" },
  ];

  // Create seamless circular loop by duplicating logos
  // This ensures the animation appears continuous without any visible restart
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <Section padding={false} className="overflow-hidden">
      <div className="flex items-center animate-scroll ">
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="flex items-center justify-center p-4 md:p-8 lg:p-16 flex-shrink-0"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={100}
              height={100}
              className="object-contain hover:opacity-80 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </Section>
  );
}
