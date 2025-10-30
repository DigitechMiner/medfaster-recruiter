import React from "react";
import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { Heading } from "@/components/custom/heading";
import { Paragraph } from "@/components/custom/paragraph";

interface FeatureCardProps {
  title: string;
  description?: string;
  visual?: {
    type: "image" | "icon";
    content: string | LucideIcon;
    alt?: string;
  };
  imageFullWidth?: boolean;
  imageCenter?: boolean;
}

export function FeatureCard({ title, description, visual, imageFullWidth = false, imageCenter = false }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start text-left border-b border-[#E9EAEB] pb-6">
      {visual && (
        <div className={imageFullWidth ? "w-full mb-6" : ""}>
          {visual.type === "image" && (
            <div className={imageFullWidth ? "relative w-full aspect-[500/327]" : "relative w-40 h-80 sm:w-48 sm:h-96"}>
              <Image 
                src={visual.content as string}
                alt={visual.alt || title}
                fill
                className={`object-contain rounded-xl ${imageCenter ? "object-center md:object-left" : "object-left"}`}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          {visual.type === "icon" && (
            <>{React.createElement(visual.content as LucideIcon, { className: "w-12 h-12 text-[#F4781B] mb-4" })}</>
          )}
        </div>
      )}

      <Heading as="h3" size="xs" weight="medium" className="text-[#252B37] mb-3">
        {title}
      </Heading>

      {description && (
        <Paragraph className="text-[#717680] leading-relaxed">
          {description}
        </Paragraph>
      )}
    </div>
  );
}


