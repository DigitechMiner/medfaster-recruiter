"use client";

import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowRight, Wand2, ShieldCheck, Briefcase } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/ui/paragraph";

export default function HiredSection() {
  const steps = [
    {
      icon: Wand2,
      title: "Automated Screening",
      description:
    "Our AI instantly parses resumes, verifies licenses, and filters candidates based on your exact criteria, eliminating hours of manual review."},
    {
      icon: ShieldCheck,
      title: "Smart Matching",
      description:
        "Receive a pre-vetted shortlist of top-fit candidates in seconds. Our algorithm ranks professionals by skill, experience, and availability",
    },
    {
      icon: Briefcase,
      title: "Predictive Insights",
      description:
        "Forecast a candidate's potential performance using data-driven insights, helping you make more confident hiring decisions.",
    },
    {
      icon: Briefcase,
      title: "AI-Powered Interviews",
      description:
        "Automatically and impartially assess a candidate's communication skills and professionalism with our standardized behavioral interviews.",
    },
    {
      icon: Briefcase,
      title: "Built-in Trust Layer",
      description:
        "Hire with confidence. Every candidate profile includes verified credentials and a performance rating history from past roles on our platform.",
    },
  ];

  return (
    <Section 
      backgroundColor="bg-[#F4781B]"
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url(/img/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content */}
      <div className="relative">
        {/* Top Text Section */}
        <div className=" mb-8">
            <Heading className="text-white mb-4">
              Smarter, Faster, and More Reliable Hiring
            </Heading>
          <ResponsiveParagraph size="base" className="text-white max-w-2xl">
            Our AI-powered platform automates screening and matching, connecting you with top-tier talent in record time
          </ResponsiveParagraph>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-left">
          {/* Left Side - Image */}
          <div className="order-2 lg:order-1">
            <div className="relative h-[400px] lg:h-[700px]">
              <Image
                src="/img/doc-with-ipad.png"
                alt="Healthcare professional assisting patient"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Side - Steps */}
          <div className="order-1 lg:order-2 text-white">
            <div className="space-y-6 mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 border-b border-white/20 pb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-opacity-20 rounded-full flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <Heading as="h3" size="xs" weight="medium" className="text-white mb-2">{step.title}</Heading>
                    <ResponsiveParagraph size="sm" className="text-white text-opacity-90 leading-relaxed">
                      {step.description}
                    </ResponsiveParagraph>
                  </div>
                </div>
              ))}
            </div>

            <CustomButton
              className="bg-white text-black hover:bg-gray-100"
              rightIcon={ArrowRight}
              iconClassName="text-white"
              iconContainerClassName="bg-[#F4781B]"
            >
              Post a job
            </CustomButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
