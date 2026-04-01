'use client';

import React from 'react';
import { Paragraph } from '@/components/custom/paragraph';
import { cn } from '@/lib/utils';

type ScoreCardProps = {
  category: string;
  score: number;
  maxScore: number;
  className?: string;
  noBackground?: boolean;
};

type ScoreColor = 'green' | 'orange' | 'red';

// Score color definitions
const SCORE_COLORS = {
  success: '#10B981', // green-500
  warning: '#F59E0B', // orange-500
  danger: '#EF4444', // red-500
};

// Determines the score color based on score and maxScore
const getScoreColor = (score: number, maxScore: number): ScoreColor => {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 70) {
    return 'green';
  } else if (percentage >= 40) {
    return 'orange';
  } else {
    return 'red';
  }
};

// Gets Tailwind CSS classes for score colors
const getScoreColorClasses = (color: ScoreColor): { border: string; text: string; bg: string } => {
  switch (color) {
    case 'green':
      return {
        border: 'border-[#17B26A]',
        text: 'text-[#17B26A]',
        bg: 'bg-[#17B26A]',
      };
    case 'orange':
      return {
        border: 'border-orange-200',
        text: 'text-orange-600',
        bg: 'bg-orange-50',
      };
    case 'red':
      return {
        border: 'border-red-200',
        text: 'text-red-600',
        bg: 'bg-red-50',
      };
  }
};

// Get the actual color value for SVG
const getColorValue = (colorType: ScoreColor): string => {
  switch (colorType) {
    case 'green':
      return SCORE_COLORS.success;
    case 'orange':
      return SCORE_COLORS.warning;
    case 'red':
      return SCORE_COLORS.danger;
  }
};

const CircularProgress = ({ 
  score, 
  maxScore, 
  color 
}: { 
  score: number; 
  maxScore: number; 
  color: ScoreColor;
}) => {
  const percentage = (score / maxScore) * 100;
  const radius = 10; // 24px container - 8px stroke = 16px diameter, so radius = 8px
  const backgroundStrokeWidth = 4; // Inner circle (background) - thinner
  const progressStrokeWidth = 3; // Outer circle (progress) - thicker, creates layered effect
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <svg width={24} height={24} style={{ transform: 'rotate(-30deg)' }}>
        {/* Background circle */}
        <circle
          cx={12}
          cy={12}
          r={radius}
          stroke="#E5E7EB" // gray-200
          strokeWidth={backgroundStrokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={12}
          cy={12}
          r={radius}
          stroke={getColorValue(color)}
          strokeWidth={progressStrokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(90 12 12)`}
        />
      </svg>
    </div>
  );
};

const COLOR_VALUES: Record<ScoreColor, string> = {
  green:  '#17B26A',
  orange: '#F59E0B',
  red:    '#EF4444',
};

export default function ScoreCard({ score, maxScore, className = '', noBackground = false }: ScoreCardProps) {
  const scoreColor  = getScoreColor(score, maxScore);
  const colorValue  = COLOR_VALUES[scoreColor];

  // Text colors stay as Tailwind (these ARE static — safe)
  const textClass = scoreColor === 'green'
    ? 'text-[#17B26A]'
    : scoreColor === 'orange'
    ? 'text-orange-600'
    : 'text-red-600';

  return (
    <div
      className={cn('bg-white rounded-lg p-2', !noBackground && 'border-2', className)}
      style={!noBackground ? { borderColor: colorValue } : undefined}  // ✅ inline — always works
    >
      <div className="flex flex-row items-center justify-between gap-2">
        <CircularProgress score={score} maxScore={maxScore} color={scoreColor} />
        <div className="flex flex-col items-end">
          <div className="flex flex-row items-baseline">
            <span className={cn('text-xs font-normal mb-1', textClass)}>{score}</span>
            <span className="text-xs font-normal text-gray-900 mb-1">/{maxScore}</span>
          </div>
          <Paragraph size="xs" weight="semibold" className="text-gray-600">Score</Paragraph>
        </div>
      </div>
    </div>
  );
}

// Export types for external use
export type { ScoreCardProps };

