'use client'

import { Section } from "@/components/ui/section"
import { FeatureCard } from "@/components/ui/feature-card"
import { Heading } from "@/components/ui/heading"
import { Paragraph } from "@/components/ui/paragraph"
import Image from "next/image"

export default function OneDashboard() {
  const features = [
    {
      screen: "/img/ipad/ipad-1.png",
      title: "Candidate Piepline",
      description: ""},
    {
      screen: "/img/ipad/ipad-2.png",
      title: "AI Ranking",
      description:""
    },
    {
      screen: "/img/ipad/ipad-3.png",
      title: "Interview Scheduling",
      description:""
    },
    {
      screen: "/img/ipad/ipad-4.png",
      title: "Notes & Logs",
      description:""
    },
    {
      screen: "/img/ipad/ipad-5.png",
      title: "Analytics Dashboard",
      description:""
    },
    {
      screen: "/img/ipad/ipad-6.png",
      title: "Communication Tools",
      description:""
    }
  ]; 
return (
    <Section>
      {/* Header */}
      <div className=" mb-12">
        <Heading as="h2" size="md" className="text-[#252B37] mb-4">
          Everything You Need, in{" "}
          <span className="text-[#F4781B]">One Dashboard</span>{" "}
        </Heading>
        <Paragraph className="text-[#717680] max-w-3xl">
          "Discover the intelligent technology that works behind the scenes to connect you with your next role, faster".</Paragraph>
      </div>

     {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
  {features.map((feature, index) => (
    <div 
      key={index}
      className="flex flex-col group"
    >
      {/* Image Container with Border */}
      <div className="relative w-full aspect-[500/327] mb-6 overflow-hidden rounded-">
        <Image
          src={feature.screen}
          alt={feature.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Title - Left Aligned */}
      <h3 className="text-[#252B37] text-xl font-medium text-left">
        {feature.title}
      </h3>
    </div>
        ))}
      </div>
    </Section>
  );
}