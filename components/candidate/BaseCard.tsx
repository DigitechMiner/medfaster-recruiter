"use client";

import React from "react";

interface BaseCardProps {
  className: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}

interface CardSectionProps {
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function BaseCard({ className, style, onClick, children }: BaseCardProps) {
  return (
    <div className={className} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ className, style, children }: CardSectionProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function CardIdentity({ className, style, children }: CardSectionProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function CardStats({ className, style, children }: CardSectionProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
