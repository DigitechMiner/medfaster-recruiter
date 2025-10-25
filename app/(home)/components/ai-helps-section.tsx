"use client";

import { 
  FileText, 
  Target, 
  Calendar, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";

export default function AIHelpsSection() {
  const features = [
    {
      icon: FileText,
      title: "AI Resume Parsing",
      description: "Build your professional profile in seconds, not hours. Just upload your documents and our AI does the rest."
    },
    {
      icon: Target,
      title: "Smart Job Matching",
      description: "Stop scrolling through irrelevant listings. Get matched with roles that fit your specific skills and schedule."
    },
    {
      icon: Calendar,
      title: "Predictive Availability",
      description: "Our system anticipates employer needs to show you jobs that match your future availability and experience."
    },
    {
      icon: MessageSquare,
      title: "Confidential AI Feedback",
      description: "After your AI interview, get private feedback on your strengths to help you stand out to employers."
    },
    {
      icon: ShieldCheck,
      title: "Verified Opportunities",
      description: "Apply with total confidence. Our system helps verify every employer, so you only see trusted, high-quality roles."
    }
  ];

  return (
    <section className="w-full bg-white rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl p-4 md:p-8 lg:p-16">
      {/* Header */}
      <div className=" mb-12">
        <h2 className="text-5xl font-medium text-[#252B37] mb-4">
          How{" "}
          <span className="text-[#F4781B]">AI Helps You</span>{" "}
          Get the Right Job Faster
        </h2>
        <p className="text-base font-normal text-[#717680] max-w-3xl">
          Our intelligent platform works behind the scenes to help you get the right job, faster. Here's how:
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex flex-col items-start text-left p-6 border-b border-[#E9EAEB] pb-6"
          >
            {/* Icon */}
       
              <feature.icon className="w-12 h-12 text-[#F4781B] mb-4" />
         

            {/* Title */}
            <h3 className="text-xl font-medium text-[#252B37] mb-3">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-base font-normal text-[#717680] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
