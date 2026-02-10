"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MetricCardProps } from "../types";

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  percentChange,
  isPositive,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 sm:p-5 border-2 transition-all hover:shadow-md cursor-pointer ${
        isActive ? "border-orange-400" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            isPositive ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-600" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600" />
          )}
          <span
            className={`text-xs font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {percentChange}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};
