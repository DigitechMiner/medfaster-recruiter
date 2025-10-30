import React from "react";
import { cn } from "@/lib/utils";

interface ParagraphProps {
  size?: "xs" | "sm" | "base" | "lg";
  weight?: "normal" | "medium" | "semibold" | "bold";
  className?: string;
  children: React.ReactNode;
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const responsiveSizeClasses = {
  xs: "text-xs sm:text-sm",
  sm: "text-sm sm:text-base",
  base: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Paragraph({
  size = "base",
  weight = "normal",
  className = "",
  children,
}: ParagraphProps) {
  const sizeClass = sizeClasses[size];
  const weightClass = weightClasses[weight];

  return (
    <p className={cn(sizeClass, weightClass, className)}>
      {children}
    </p>
  );
}

export function ResponsiveParagraph({
  size = "base",
  weight = "normal",
  className = "",
  children,
}: ParagraphProps) {
  const sizeClass = responsiveSizeClasses[size];
  const weightClass = weightClasses[weight];

  return (
    <p className={cn(sizeClass, weightClass, className)}>
      {children}
    </p>
  );
}


