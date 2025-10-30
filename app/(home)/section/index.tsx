"use client";

import Image from "next/image";
import { CustomButton } from "@/components/custom/custom-button";
import { ArrowRight, Wand2, ShieldCheck, Briefcase, DownloadIcon, ChevronRight, CalendarRange } from "lucide-react";
import { Section } from "@/components/custom/section";
import { Heading } from "@/components/custom/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/custom/paragraph";
import { FeatureCard } from "@/components/custom/feature-card";
import { companyLogos, hiringSteps, dashboardFeatures } from "@/constants/landingPage";

// Hero Section
export function HeroSection() {
  return (
    <Section className="!pb-0">
      {/* Two Grid Layout - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* First Grid Section - Left 50% */}
        <div className="flex flex-col justify-between h-full space-y-8">
          {/* Main Heading */}
          <div className="text-left">
            <Heading
              as="h1"
              size="lg"
              weight="normal"
              className="text-[#252B37] mb-6"
            >
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
            AI-powered recruitment platform built for Canadian hospitals and
            clinics. Find pre-screened, credentialed candidates instantly.
          </p>

            <CustomButton 
              rightIcon={ChevronRight}
              className="!bg-transparent"
              style={{
                background: 'linear-gradient(225deg, #EB001B 0%, #F79E1B 100%)'
              }}
            >
              Request Demo
            </CustomButton>

        </div>
      </div>
      <Section
        padding={false}
        className="flex overflow-hidden items-end justify-end "
      >
        <div className="relative mt-10 max-w-7xl mx-auto">
          <Image
            src="/img/dashboard/dashboard-hero.png"
            alt="Verified score card showing Dr. Noah Liam profile"
            width={1200}
            height={600}
            className="object-contain"
            priority
            unoptimized
            quality={100}
          />
        </div>
      </Section>
    </Section>
  );
}

// Company Logos Section
export function CompanyLogos() {
  // Create seamless circular loop by duplicating logos
  // This ensures the animation appears continuous without any visible restart
  const duplicatedLogos = [...companyLogos, ...companyLogos, ...companyLogos];

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

// Hired Section
export function HiredSection() {
  const steps = hiringSteps.map((s, idx) => ({
    icon: [Wand2, ShieldCheck, Briefcase, Briefcase, Briefcase][idx] || Briefcase,
    ...s,
  }));

  return (
    <Section 
      backgroundColor="bg-transparent"
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(225deg, #EB001B 0%, #F79E1B 100%), url("/img/patterns/pattern-01.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundRepeat: 'no-repeat'
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
            <div className="relative h-[300px] lg:h-[700px]">
              <Image
                src="/img/hero/doctor-with-ipad.png"
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

// One Dashboard Section
export function OneDashboard() {
  const features = dashboardFeatures;
  return (
    <Section>
      {/* Header */}
      <div className=" mb-12">
        <Heading as="h2" size="md" className="text-[#252B37] mb-4">
          Everything You Need, in{" "}
          <span className="text-[#F4781B]">One Dashboard</span>{" "}
        </Heading>
        <Paragraph className="text-[#717680] max-w-3xl">
          &ldquo;Discover the intelligent technology that works behind the scenes to
          connect you with your next role, faster&rdquo;.
        </Paragraph>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            imageFullWidth={true}
            visual={{
              type: "image",
              content: feature.screen,
              alt: feature.title,
            }}
          />
        ))}
      </div>
    </Section>
  );
}

// Data Driven Hiring Section
export function DataDrivenHiring() {
  return (
    <Section>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Content */}
        <div className="flex-1 max-w-3xl">
          <Heading className="text-[#252B37] mb-6">
            Make <span className="text-[#F4781B] font-semibold">Data-Driven</span> Hiring Decisions
          </Heading>
          <Paragraph className="text-[#717680] leading-relaxed">
            Get complete visibility into your recruitment performance from time-to-hire to candidate quality. 
            AI insights help improve efficiency and reduce cost-per-hire.
          </Paragraph>
        </div>

        {/* Right Button */}
        <div className="flex-shrink-0">
          <button className="bg-[#F4781B] text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-[#E06A15] transition-all duration-300 hover:shadow-lg hover:scale-105">
            Book Demo
          </button>
        </div>
      </div>
    </Section>
  );
}

// Hire With Confidence Section
export function HireWithConfidence() {
  return (
    <Section>
      {/* Header - Title and Description */}
      <div className="mb-12 lg:mb-16">
        <Heading className="text-[#252B37] mb-6">
          Hire with <span className="text-[#F4781B] font-semibold">Confidence</span>
        </Heading>
        <Paragraph className="text-[#717680] leading-relaxed max-w-3xl">
          You&apos;ll only see candidates who are pre-screened, verified, and AI-rated — saving time and ensuring compliance.
        </Paragraph>
      </div>

      {/* Main Content Image */}
      <div className="w-full max-w-7xl mx-auto">
        <Image
          src="/img/features/confidence.png"
          alt="Candidate verification and confidence scoring"
          width={1200}
          height={600}
          className="w-full h-auto rounded-2xl"
        />
      </div>
    </Section>
  );
}

// Start Hiring Section
export function StartHiring() {
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
      {" "}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] ">
        {/* Left Side - Content */}
        <div className="p-4 md:p-8 lg:p-16 flex flex-col gap-6 justify-center">
            <Heading as="h1" size="md" className="text-white tracking-widest">
             Start Smart Hiring Today
            </Heading>

            <ResponsiveParagraph size="base" className="text-white/90 max-w-xl leading-relaxed">
              Find trusted healthcare professionals in minutes — powered by AI.
            </ResponsiveParagraph>

            {/* Buttons */}
            <div className="flex flex-wrap md:flex-row ">
              <CustomButton
                className="bg-white text-black hover:bg-gray-100 mr-2 md:mr-4"
                rightIcon={ArrowRight}
                iconClassName="text-white"
                iconContainerClassName="bg-[#F4781B]"
              >
                Post a Job
              </CustomButton>

              <CustomButton
                className="bg-white text-black hover:bg-gray-100"
                rightIcon={CalendarRange}
                iconClassName="text-white"
                iconContainerClassName="bg-[#F4781B]"
              >
                Schedule Demo
              </CustomButton>
           
          </div>
        </div>

        {/* Right Side - Nurse Image */}
        <div className="relative flex items-end justify-center lg:justify-end overflow-hidden md:block">
          <div className="relative w-full h-[250px] md:h-[300px] lg:h-[400px]">
            <Image
              src="/img/people/nurse-02.png"
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
}

