import React from "react";

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  className?: string;
  children: React.ReactNode;
}

const sizeClasses = {
  xs: "text-xl",
  sm: "text-2xl md:text-3xl lg:text-4xl",
  md: "text-3xl md:text-4xl lg:text-5xl",
  lg: "text-4xl md:text-5xl lg:text-6xl",
  xl: "text-5xl md:text-6xl lg:text-7xl",
  "2xl": "text-6xl md:text-7xl lg:text-8xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Heading({
  as = "h2",
  size = "md",
  weight = "medium",
  className = "",
  children,
}: HeadingProps) {
  const Component = as;
  const sizeClass = sizeClasses[size];
  const weightClass = weightClasses[weight];

  return (
    <Component className={`${sizeClass} ${weightClass} ${className}`}>
      {children}
    </Component>
  );
}


