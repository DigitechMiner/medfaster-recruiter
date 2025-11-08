"use client";

import React from "react";
import Image from "next/image";
import { Job } from "@/Interface/job.types";

interface CandidateHeroProps {
  candidate: Job;
  appliedTime: string;
}

export const CandidateHero: React.FC<CandidateHeroProps> = ({
  candidate,
  appliedTime,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
      {/* Top Section - Responsive */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Profile Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 mx-auto sm:mx-0">
          <Image
            src="/svg/Photo.svg"
            alt={candidate.doctorName}
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center sm:text-left">
              {candidate.doctorName}
            </h1>
            <span className="text-orange-600 text-xs sm:text-sm font-semibold text-center sm:text-right whitespace-nowrap">
              {appliedTime}
            </span>
          </div>

          {/* Contact Info - Responsive Grid */}
          <div className="space-y-3">
            {/* Row 1: Location, Email, Chat */}
            <div className="flex flex-col sm:flex-row sm:divide-x divide-gray-300 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center justify-center sm:justify-start gap-2 px-0 sm:px-4 py-2 sm:pl-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx={12} cy={10} r={3} />
                </svg>
                <span className="truncate">Toronto, Canada</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 px-0 sm:px-4 py-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x={2} y={4} width={20} height={16} rx={2} />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="truncate">noahliamdoc@gmail.com</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 px-0 sm:px-4 py-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.86l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
                <a
                  href="#"
                  className="text-orange-600 font-medium hover:underline"
                >
                  Chat
                </a>
              </div>
            </div>

            {/* Row 2: Phone, Part Time */}
            <div className="flex flex-col sm:flex-row sm:divide-x divide-gray-300 text-xs sm:text-sm">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 px-0 sm:px-4 py-2 sm:pl-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+1 123 1231 213</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 px-0 sm:px-4 py-2">
                <span>Part Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Column Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 border-t border-gray-200 pt-6 sm:pt-8">
        <div className="lg:border-r border-gray-200 lg:pr-8">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 6h-2.15a2.01 2.01 0 0 0-3.97 0h-2.68a2.01 2.01 0 0 0-3.97 0H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
            </svg>
            <span className="text-xs text-gray-600">Total work experience</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">5+ Years</p>
        </div>

        <div className="lg:border-r border-gray-200 lg:pr-8">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span className="text-xs text-gray-600">Current Role</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">
            Assistant of audiology
          </p>
        </div>

        <div className="lg:border-r border-gray-200 lg:pr-8">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            <span className="text-xs text-gray-600">Current Company</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">Medfaster</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
            </svg>
            <span className="text-xs text-gray-600">Preferred Location</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900">Toronto, Canada</p>
        </div>
      </div>

      {/* Tags Section - Responsive */}
      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <p className="text-xs sm:text-sm font-semibold text-orange-600 min-w-fit">
            Specialization :
          </p>
          <div className="flex flex-wrap gap-2">
            {candidate.specialization.map((spec, i) => (
              <span key={i} className="px-2 py-1 text-gray-700 rounded text-xs">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <p className="text-xs sm:text-sm font-semibold text-orange-600 min-w-fit">
            Qualification :
          </p>
          <div className="flex flex-wrap gap-2">
            {candidate.specialization.map((qual, i) => (
              <span key={i} className="px-2 py-1 text-gray-700 rounded text-xs">
                {qual}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <p className="text-xs sm:text-sm font-semibold text-orange-600 min-w-fit">
            Work Eligibility :
          </p>
          <span className="px-2 py-1 text-gray-700 rounded text-xs">
            Canadian Citizen
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <p className="text-xs sm:text-sm font-semibold text-orange-600 min-w-fit">
              Skill :
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Cardiology",
                "Orthopedics",
                "Dermatology",
                "Orthopedics",
                "Oncology",
                "Dermatology",
                "Orthopedics",
                "Oncology",
                "Neurology",
              ].map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <p className="text-xs sm:text-sm font-semibold text-orange-600 min-w-fit">
              Hobby :
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Hiking",
                "Cycling",
                "Gardening",
                "Photography",
                "Volunteering",
              ].map((hobby, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
