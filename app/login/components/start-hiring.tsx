import Image from "next/image";
import React from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowRight, Download } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { ResponsiveParagraph } from "@/components/ui/paragraph";

const StartHiring = () => {
  return (
    <Section 
      backgroundColor="bg-[#F4781B]"
      padding={false}
      style={{
        backgroundImage: "url(/img/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {" "}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] ">
        {/* Left Side - Content */}
        <div className="p-4 md:p-8 lg:p-16 flex flex-col justify-center">
          <div className="space-y-2 md:space-y-4 lg:space-y-6 xl:space-y-8">
            <Heading as="h1" size="md" className="text-white tracking-widest">
             Start Smart Hiring Today
            </Heading>

            <ResponsiveParagraph size="base" className="text-white/90 max-w-xl leading-relaxed">
              Find trusted healthcare professionals in minutes — powered by AI.StartHiring   </ResponsiveParagraph>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <CustomButton
                className="bg-white text-black hover:bg-gray-100"
                rightIcon={ArrowRight}
                iconClassName="text-white"
                iconContainerClassName="bg-[#F4781B]"
              >
                Post a Job
              </CustomButton>

              <CustomButton
                className="bg-white text-black hover:bg-gray-100"
                rightIcon={Download}
                iconClassName="text-white"
                iconContainerClassName="bg-[#F4781B]"
              >
                Schedule Demo
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Right Side - Nurse Image */}
        <div className="relative flex items-end justify-center lg:justify-end overflow-hidden md:block">
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-full">
            <Image
              src="/img/nurse02.png"
              alt="Healthcare professional"
              fill
              className="object-contain object-bottom lg:object-right-bottom"
              priority
              sizes="(max-width: 768px) 33vw, 50vw"
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default StartHiring;
