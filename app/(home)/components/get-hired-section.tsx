"use client";

import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowRight, Wand2, ShieldCheck, Briefcase } from "lucide-react";
// Removed invalid import from public folder
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/ui/paragraph";

export default function GetHiredSection() {
  // Use string URLs for icons pointing to public folder SVGs
  const steps = [
    {
      iconSrc: "/svg/hiredOne.svg",
      title: "Create Your Profile",
      description:
        "Upload your resume and certificates, and let our AI auto-fill your details instantly.",
    },
    {
      iconSrc: "/svg/hiredTwo.svg",
      title: "Verify & Pre-Screen",
      description:
        "Get your credentials verified and complete a short AI interview to showcase your skills to top employers.",
    },
    {
      iconSrc: "/svg/hiredThree.svg",
      title: "Start Working",
      description:
        "Apply for nearby shifts or full-time roles and get paid directly and reliably through the platform.",
    },
  ];

  return (
    <Section
      backgroundColor="bg-[#F4781B]"
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url(/img/pattern/01.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content */}
      <div className="relative">
        {/* Top Text Section */}
        <div className=" mb-8">
          <Heading className="text-white mb-4">Get Hired in 3 Simple Steps</Heading>
          <ResponsiveParagraph size="base" className="text-white max-w-2xl">
            Our AI-powered process makes finding your next role faster and more direct than ever before.
          </ResponsiveParagraph>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-left">
          {/* Left Side - Image */}
          <div className="order-2 lg:order-1">
            <div className="relative h-[400px] lg:h-[500px]">
              <Image
                src="/img/hired.png"
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
                <div
                  key={index}
                  className="flex items-start gap-4 border-b border-white/20 pb-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-opacity-20 rounded-full flex items-center justify-center">
                    {/* Use Image component to render icon */}
                    <Image
                      src={step.iconSrc}
                      alt={step.title + " icon"}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <Heading
                      as="h3"
                      size="xs"
                      weight="medium"
                      className="text-white mb-2"
                    >
                      {step.title}
                    </Heading>
                    <ResponsiveParagraph
                      size="sm"
                      className="text-white text-opacity-90 leading-relaxed"
                    >
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
              Get Started
            </CustomButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
