"use client";

import Image from "next/image";
import { Section } from "@/components/custom/section";
import { Heading } from "@/components/custom/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/custom/paragraph";
import { CustomButton } from "@/components/custom/custom-button";
import { Calendar } from "lucide-react";

export default function BookADemo() {
  return (
    <Section
      backgroundColor="bg-transparent"
      padding={false}
      style={{
        background: 'linear-gradient(225deg, #EB001B 0%, #F79E1B 100%), url("/img/patterns/pattern-02.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <div className="p-4 md:p-8 lg:p-16 py-8 space-y-8">
          {/* Logo */}
          <div className="flex-shrink-0 w-56 md:w-64 lg:w-80 flex items-center">
            <Image
              src="/img/brand/medfaster-logo.png"
              height={50}
              width={300}
              alt="MeDFaster"
              objectFit="contain"
              priority
            />
          </div>

          {/* Heading */}
          <Heading as="h2" size="md" className="text-white ">
            Manage <span className="font-bold">Payments</span> Seamlessly
          </Heading>

          {/* CTA Button */}
          <CustomButton
            size="lg"
            rightIcon={Calendar}
            className="!bg-white !text-gray-800 hover:shadow-xl transition-all duration-300"
            iconContainerClassName="!bg-[#F4781B]"
            iconClassName="!text-white"
          >
            Book a Demo
          </CustomButton>
        </div>

        {/* Right Content - Payment Card with Doctors */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg aspect-square overflow-visible flex items-center justify-center">
            {/* Central White Circle */}
            <div className="relative w-[250px] h-[250px] md:w-[280px] md:h-[280px] lg:w-[300px] lg:h-[300px] bg-white rounded-full shadow-xl flex flex-col items-center justify-center ">
              {/* Logo */}
              <div className="mb-3 flex flex-col items-center">
                <Image
                  src="/img/company/canadian-health-logo.png"
                  alt="Company Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto mb-2 object-contain"
                />
              </div>

              {/* Price */}
              <ResponsiveParagraph
                size="lg"
                weight="bold"
                className=" text-[#F4781B] mb-2"
              >
                $12,500
              </ResponsiveParagraph>

              {/* Role */}
              <Paragraph
                size="sm"
                className="md:text-base text-[#252B37] mb-1 text-center"
              >
                Assistant of audiology
              </Paragraph>

              {/* Status */}
              <Paragraph size="xs" className="md:text-sm text-[#717680]">
                Paid
              </Paragraph>

              {/* Top Right Doctor */}
              <div className="absolute -right-10 md:-right-14 lg:-right-16 -top-10 md:-top-14 lg:-top-16 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                  <Image
                    src="/img/hero/doctor.png"
                    alt="Doctor"
                    fill
                    className="object-cover p-2"
                  />
                </div>
              </div>

              {/* Bottom Right Doctor */}
              <div className="absolute -right-10 md:-right-14 lg:-right-16 -bottom-10 md:-bottom-14 lg:-bottom-16 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                  <Image
                    src="/img/people/nurse-01.png"
                    alt="Doctor"
                    fill
                    className="object-cover p-2"
                  />
                </div>
              </div>

              {/* Bottom Left Doctor */}
              <div className="absolute -left-10 md:-left-14 lg:-left-16 -bottom-10 md:-bottom-14 lg:-bottom-16 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-white overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                  <Image
                    src="/img/people/nurse-02.png"
                    alt="Doctor"
                    fill
                    className="object-cover p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
