"use client";

import { Section } from "@/components/ui/section";
import { FeatureCard } from "@/components/ui/feature-card";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

export default function OneDashboard() {
  const features = [
    {
      screen: "/img/ipad/ipad-1.png",
      title: "Candidate Piepline",
    },
    {
      screen: "/img/ipad/ipad-2.png",
      title: "AI Ranking",
    },
    {
      screen: "/img/ipad/ipad-3.png",
      title: "Interview Scheduling",
    },
    {
      screen: "/img/ipad/ipad-4.png",
      title: "Notes & Logs",
    },
    {
      screen: "/img/ipad/ipad-5.png",
      title: "Analytics Dashboard",
    },
    {
      screen: "/img/ipad/ipad-6.png",
      title: "Communication Tools",
    },
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
