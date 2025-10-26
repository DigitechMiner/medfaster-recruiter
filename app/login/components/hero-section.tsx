import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import InputIcon from "@/components/ui/input-icon";
import { Search, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

export default function HeroSection() {
  return (
    <Section>
      {/* Two Grid Layout - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ">
        {/* First Grid Section - Left 50% */}
        <div className="flex flex-col justify-between h-full space-y-8">
          {/* Main Heading */}
          <div className="text-left">
            <Heading as="h1" size="lg" weight="normal" className="text-[#252B37] mb-6">
              Hire Verified Healthcare Professionals —
              <span className="text-[#F4781B] font-medium">
                {" "}
                Faster than ever
              </span>
            </Heading>
          </div>
          </div>
          {/* Second Grid Section - Right 50% */}
    <div className="flex flex-col justify-start space-y-6">
      {/* Description Text */}
      <p className="text-[#252B37] text-base lg:text-lg leading-relaxed">
        AI-powered recruitment platform built for Canadian hospitals and clinics. 
        Find pre-screened, credentialed candidates instantly.
      </p>

      {/* Custom Button Component */}
      <div>
        <CustomButton rightIcon={ArrowRight}>
                Request Demo
              </CustomButton>
      </div>
    </div>
          </div>
          <Section padding={false} className="flex overflow-hidden items-end justify-end ">
                    <div className="relative mt-10 max-w-7xl mx-auto">
                      <Image 
                        src="/img/ipad.png" 
                        alt="Verified score card showing Dr. Noah Liam profile"
                        width={1198}
                        height={480}
                        className="object-contain"
                        priority
                      />
                    </div>
                  </Section>
          </Section>
  )
};