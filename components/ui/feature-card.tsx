import React from "react";
import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

interface FeatureCardProps {
  title: string;
  description: string;
  visual?: {
    type: "image" | "icon";
    content: string | LucideIcon;
    alt?: string;
  };
}

export function FeatureCard({ title, description, visual }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start text-left border-b border-[#E9EAEB] pb-6">
      {/* Visual element (image or icon) */}
      {visual && (
        <div>
          {visual.type === "image" && (
            <div className="relative w-40 h-80 sm:w-48 sm:h-96">
              <Image 
                src={visual.content as string}
                alt={visual.alt || title}
                fill
                className="object-contain rounded-xl"
              />
            </div>
          )}
          {visual.type === "icon" && (
            <>{React.createElement(visual.content as LucideIcon, { className: "w-12 h-12 text-[#F4781B] mb-4" })}</>
          )}
        </div>
      )}

      {/* Title */}
      <Heading as="h3" size="xs" weight="medium" className="text-[#252B37] mb-3">
        {title}
      </Heading>

      {/* Description */}
      <Paragraph className="text-[#717680] leading-relaxed">
        {description}
      </Paragraph>
    </div>
  );
}

