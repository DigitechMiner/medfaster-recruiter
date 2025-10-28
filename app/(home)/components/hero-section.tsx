"use client";

import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import InputIcon from "@/components/ui/input-icon";
import { Search, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/ui/paragraph";

export default function HeroSection() {
  return (
    <Section>
      {/* Two Grid Layout - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ">
        {/* First Grid Section - Left 50% */}
        <div className="flex flex-col justify-between h-full space-y-8">
          {/* Main Heading */}
          <div className="text-left">
            <Heading as="h1" size="md" weight="normal" className="text-[#252B37] mb-6">
              Find Healthcare Jobs Near You
              <span className="text-[#F4781B] font-medium">
                {" "}
                Instantly
              </span>
            </Heading>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-100 rounded-lg md:rounded-full p-2 flex flex-col md:flex-row gap-2">
            {/* Job Title - Full Row on Mobile, 2/3 on Desktop */}
            <div className="w-full lg:flex-[2]">
              <InputIcon
                icon={Search}
                iconPosition="left"
                placeholder="Job Title/Skill/Keyword"
                className="bg-white rounded-lg md:rounded-full"
              />
            </div>

            {/* Postal Code and Button Row - Mobile: Same Row, Desktop: Separate */}
            <div className="flex gap-2 lg:contents">
              <div className="flex-1 lg:flex-[1]">
                <InputIcon
                  icon={MapPin}
                  iconPosition="left"
                  placeholder="Postal Code"
                  className="bg-white rounded-lg md:rounded-full"
                />
              </div>
              <Button className="bg-[#F4781B] hover:bg-[#E06A0A] text-white w-12 h-12 rounded-lg md:rounded-full p-0 flex-shrink-0">
                <Search className="w-5 h-5 " />
              </Button>
            </div>
          </div>

          {/* Call to Action */}
          <div>
            <ResponsiveParagraph size="base" className="text-[#252B37] mb-6">
              The AI-powered platform connecting you directly with verified
              Health care service providers, such as hospitals, nursing home
              facilities, medical clinics, dental Clinics, physiotherapy clines
              and many more Canada. Discover full-time, part-time, and on-demand
              roles all on your terms.
            </ResponsiveParagraph>
            <div className="flex items-center gap-4">
              <CustomButton rightIcon={ArrowRight}>
                Browse Nearby Jobs
              </CustomButton>

              {/* Profile Pictures */}
              <div className="flex -space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
                  alt="User 1"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format"
                  alt="User 2"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
                  alt="User 1"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format"
                  alt="User 2"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second Grid Section - Right 50% - Left and Right Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-6">
          {/* Left Side Section */}
          <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Address Image */}
            <div className="md:flex-[3] relative bg-[#f5f5f5] rounded-lg flex items-center justify-center">
              <Image
                src="/img/ADDRESS.png"
                alt="MedFasterrr app interface"
                width={280}
                height={450}
                className="object-contain w-full rounded-lg max-w-[380px] aspect-[280/450]"
              />
            </div>

            {/* Total Flexibility & Control Box */}
            <div className="md:flex-[1] bg-[#F4781B] rounded-lg p-4 text-white flex flex-col justify-center">
              <Heading as="h3" size="xs" weight="bold" className="text-white mb-2">
                Total Flexibility & Control
              </Heading>
              <Paragraph className="text-white leading-relaxed">
                Take charge of your career. Filter for full-time, part-time, or
                single on-demand shifts that fit your schedule. Get instant alerts
                for jobs you actually want.
              </Paragraph>
            </div>
          </div>

          {/* Right Side Section */}
          <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Doctor Image - First on mobile, Second on desktop */}
            <div className=" order-1 md:order-2 md:flex-[3] relative bg-[#f5f5f5] rounded-lg flex items-center justify-center">
              <Image
                src="/img/doctor.png"
                alt="Professional doctor"
                width={280}
                height={450}
                className="object-cover object-top w-full rounded-lg max-w-[380px] aspect-[280/450]"
              />
            </div>

            {/* Direct & Verified Opportunities Box - Second on mobile, First on desktop */}
            <div className="order-2 md:order-1 md:flex-[1] bg-[#F4781B] rounded-lg p-4 text-white flex flex-col justify-center">
              <Heading as="h3" size="xs" weight="bold" className="text-white mb-2">
                Direct & Verified Opportunities
              </Heading>
              <Paragraph className="text-white leading-relaxed font-light">
                Connect directly with top-tier hospitals and clinics. Our
                AI-powered system verifies every listing, so you can apply with
                confidence. No recruiters, no hassle.
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
