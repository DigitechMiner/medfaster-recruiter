"use client";

import Image from "next/image";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowRight, Wand2, ShieldCheck, Briefcase } from "lucide-react";

export default function GetHiredSection() {
  const steps = [
    {
      icon: Wand2,
      title: "Create Your Profile",
      description:
        "Upload your resume and certificates, and let our AI auto-fill your details instantly.",
    },
    {
      icon: ShieldCheck,
      title: "Verify & Pre-Screen",
      description:
        "Get your credentials verified and complete a short AI interview to showcase your skills to top employers.",
    },
    {
      icon: Briefcase,
      title: "Start Working",
      description:
        "Apply for nearby shifts or full-time roles and get paid directly and reliably through the platform.",
    },
  ];

  return (
    <section 
      className="w-full relative rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl bg-[#F4781B] overflow-hidden p-4 md:p-8 lg:p-16"
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
            <h1 className="text-5xl font-medium text-white mb-4">
              Get Hired in 3 Simple Steps
            </h1>
          <p className="text-lg font-normal text-white max-w-2xl ">
            Our AI-powered process makes finding your next role faster and more direct than ever before.
          </p>
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
                <div key={index} className="flex items-start gap-4 border-b border-white/20 pb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-opacity-20 rounded-full flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                    <p className="text-base font-normal text-white text-opacity-90 leading-relaxed">
                      {step.description}
                    </p>
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
    </section>
  );
}
