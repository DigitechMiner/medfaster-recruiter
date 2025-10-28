'use client'

import { Section } from "@/components/ui/section"
import { FeatureCard } from "@/components/ui/feature-card"
import { Heading } from "@/components/ui/heading"
import { Paragraph } from "@/components/ui/paragraph"

export default function AllInOneSection() {
  const features = [
    {
      screen: "/img/screens/screen1.png",
      title: "Resume & Certificate Upload",
      description: "Securely store all your professional documents in one place to create a comprehensive, standout profile"
    },
    {
      screen: "/img/screens/screen2.png",
      title: "Document Verification",
      description: "Our system verifies your credentials, giving you a badge of trust that makes your application a priority for top employers."
    },
    {
      screen: "/img/screens/screen3.png",
      title: "Map View",
      description: "Visually discover job openings in your area. See commute times and find shifts close to home.."
    },
    {
      screen: "/img/screens/screen4.png",
      title: "Job Marketplace",
      description: "Filter through full-time, contract, and freelance roles to find the perfect opportunity that fits your schedule and skills."
    },
    {
      screen: "/img/screens/screen5.png",
      title: "Wallet & Payment History",
      description: "Track your earnings and manage payments directly within the app. Get paid reliably with full transparency.."
    }
  ]; 
return (
    <Section>
      {/* Header */}
      <div className=" mb-12">
        <Heading as="h2" size="md" className="text-[#252B37] mb-4">
          Your{" "}
          <span className="text-[#F4781B]">All-in-One</span>{" "}
          Healthcare career App
        </Heading>
        <Paragraph className="text-[#717680] max-w-3xl">
          From building a verified profile to managing your payments, everything you need is right here
        </Paragraph>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            imageFullWidth={true}
            imageCenter={true}
            visual={{
              type: "image",
              content: feature.screen,
              alt: feature.title
            }}
          />
        ))}
      </div>
    </Section>
  );
}