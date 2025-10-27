"use client";

import { 
  FileText, 
  Target, 
  Calendar, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { FeatureCard } from "@/components/ui/feature-card";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

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
    <Section>
      {/* Header */}
      <div className=" mb-12">
        <Heading as="h2" size="md" className="text-[#252B37] mb-4">
          How{" "}
          <span className="text-[#F4781B]">AI Helps You</span>{" "}
          Get the Right Job Faster
        </Heading>
        <Paragraph className="text-[#717680] max-w-3xl">
          Our intelligent platform works behind the scenes to help you get the right job, faster. Here&apos;s how:
        </Paragraph>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            visual={{
              type: "icon",
              content: feature.icon
            }}
          />
        ))}
      </div>
    </Section>
  );
}
