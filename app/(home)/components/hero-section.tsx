"use client";

import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import InputIcon from "@/components/ui/input-icon";
import { Search, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full bg-white rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl p-4 md:p-8 lg:p-16">
      {/* Two Grid Layout - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ">
        {/* First Grid Section - Left 50% */}
        <div className="flex flex-col justify-between h-full space-y-8">
          {/* Main Heading */}
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-normal text-[#252B37] mb-6">
              Find Healthcare Jobs Near You
              <span className="text-[#F4781B] text-4xl lg:text-5xl font-medium">
                {" "}
                Instantly
              </span>
            </h1>
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
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Call to Action */}
          <div>
            <p className="text-lg font-normal text-[#252B37] mb-6">
              The AI-powered platform connecting you directly with verified
              Health care service providers, such as hospitals, nursing home
              facilities, medical clinics, dental Clinics, physiotherapy clines
              and many more Canada. Discover full-time, part-time, and on-demand
              roles all on your terms.
            </p>
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

        {/* Second Grid Section - Right 50% - 2x2 Grid Layout */}
        <div className="grid grid-cols-2 gap-4 h-[600px]">
          {/* Top-Left: Address Image - spans 2 rows */}
          <div className="relative row-span-3  bg-[#f5f5f5] rounded-lg">
            <Image
              src="/img/address.png"
              alt="MedFasterrr app interface"
              fill
              className="object-contain rounded-lg"
            />
          </div>

          {/* Top-Right: Direct & Verified Opportunities Box */}
          <div className="bg-[#F4781B] rounded-lg p-4 text-white flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-2">
              Direct & Verified Opportunities
            </h3>
            <p className="text-base font-normal leading-relaxed">
              Connect directly with top-tier hospitals and clinics. Our
              AI-powered system verifies every listing, so you can apply with
              confidence. No recruiters, no hassle.
            </p>
          </div>

          {/* Bottom-Right: Doctor Image */}
          <div className="relative row-span-3 bg-[#f5f5f5] rounded-lg">
            <Image
              src="/img/doctor.png"
              alt="Professional doctor"
              fill
              className="object-cover object-top w-full rounded-lg"
            />
          </div>

          {/* Bottom-Left: Total Flexibility & Control Box */}
          <div className="bg-[#F4781B] rounded-lg p-4 text-white flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-2">
              Total Flexibility & Control
            </h3>
            <p className="text-base font-normal leading-relaxed">
              Take charge of your career. Filter for full-time, part-time, or
              single on-demand shifts that fit your schedule. Get instant alerts
              for jobs you actually want.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
