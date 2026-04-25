'use client';
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MetricCardProps } from '../types';

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, percentChange, isPositive, isActive, onClick, icon, valueColor, subLabel,
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-4 border-2 transition-all ${
      onClick ? 'cursor-pointer hover:shadow-sm' : ''
    } ${isActive ? 'border-orange-400' : 'border-gray-100 hover:border-gray-200'}`}
  >
    <div className="flex items-start justify-between gap-2 mb-3">
      <p className="text-xs text-gray-500 leading-snug">{title}</p>
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>

    <p className={`text-3xl font-bold mb-1 ${valueColor ?? 'text-gray-900'}`}>{value}</p>

    {subLabel && (
      <p className="text-xs text-gray-400 mb-1">{subLabel}</p>
    )}

    {percentChange !== undefined ? (
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">Since last week</span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive
            ? <><TrendingUp className="w-3 h-3" />+{percentChange}% ↑</>
            : <><TrendingDown className="w-3 h-3" />-{percentChange}% ↓</>}
        </span>
      </div>
    ) : (
      <div className="mt-1 h-4" />
    )}
  </div>
);