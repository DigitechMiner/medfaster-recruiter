"use client";

import React from "react";
import type { JobBackendResponse } from "@/Interface/job.types";
import { Clock, MapPin, Briefcase, Timer, DollarSign, Building2 } from "lucide-react";
import { Paragraph, ResponsiveParagraph } from "@/components/custom/paragraph";
import { Heading } from "@/components/custom/heading";
import { getTimeAgo } from "@/utils/getTimePeriod";
import {
  convertJobTypeToFrontend,
  convertSpecializationToFrontend,
  convertQualificationToFrontend,
} from "@/utils/constant/metadata";

interface JobDetailSectionsProps {
  job: JobBackendResponse;
}

interface QuestionTopic {
  title: string;
  questions: string[];
}

export const JobDetailSections: React.FC<JobDetailSectionsProps> = ({ job }) => {
  const normalJob = job.normalJob;
  const instantJob = job.instantJob;

  // ✅ Bug 3 fix — fixed+additional format, handles instant same-value case
  const formatSalary = () => {
  const dollars = job.pay_per_hour_cents != null
    ? (job.pay_per_hour_cents / 100).toFixed(2)
    : null;
  if (!dollars) return "Negotiable";
  return job.job_urgency === "instant"
    ? `$${dollars}/hr (Fixed)`
    : `$${dollars}/hr`;
};

  const gridItems = [
    {
      icon: MapPin,
      label: "Location",
      value:
        [job.city, job.province].filter(Boolean).join(", ") ||
        job.street ||
        "Not specified",
    },
    {
      icon: Briefcase,
      label: "Experience Required",
      value: normalJob?.years_of_experience || "Not specified",
    },
    {
      icon: Timer,
      label: "Job Type",
      // ✅ Bug 4 fix — urgency-based label using converter
      value:
        job.job_urgency === "instant"
          ? "Instant Replacement"
          : convertJobTypeToFrontend(job.job_type),
    },
    {
      icon: DollarSign,
      label: "Salaries",
      value: formatSalary(),
    },
  ];

  const interviewQuestions = normalJob?.questions
    ? Object.entries(normalJob.questions as Record<string, QuestionTopic>).map(
        ([topicId, topicData]) => ({
          topic: topicData.title || `Topic ${topicId}`,
          questions: Array.isArray(topicData.questions) ? topicData.questions : [],
        })
      )
    : [];

  return (
    <>
      {/* Header */}
      <div className="mb-6 gap-4 flex flex-col">
        <div className="flex justify-between items-start">
          <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-orange-50 flex-shrink-0">
            <Building2 className="w-10 h-10 text-[#F4781B]" />
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === "OPEN"
                ? "bg-green-100 text-green-700"
                : job.status === "DRAFT"
                ? "bg-gray-100 text-gray-700"
                : job.status === "CLOSED"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {job.status
              ? job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()
              : "Unknown"}
          </span>
        </div>

        <div className="flex-1">
          <Paragraph size="xs" className="text-gray-500 mb-0.5 flex items-center gap-1">
            <Clock className="w-4 h-4 text-[#F4781B]" />
            {getTimeAgo(job.created_at || "")}
          </Paragraph>
          <ResponsiveParagraph size="base" className="font-semibold text-gray-900 mb-0.5">
            {job.job_title}
          </ResponsiveParagraph>
          {job.department && (
            <ResponsiveParagraph size="xs" className="text-gray-600 capitalize">
              {job.department}
            </ResponsiveParagraph>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-6 pb-2 border-b border-gray-200">
        {gridItems.map((item, index) => (
          <div
            key={index}
            className={`${
              index === 0
                ? "pr-4 border-r border-gray-200"
                : index === gridItems.length - 1
                ? "pl-4"
                : "px-4 border-r border-gray-200"
            }`}
          >
            {index === 0 ? (
              <div className="flex flex-col items-start gap-2">
                <item.icon className="w-5 h-5 text-[#F4781B]" />
                <div>
                  <Paragraph size="xs" className="text-gray-500">{item.label}</Paragraph>
                  <Paragraph size="lg" weight="semibold" className="text-xl text-gray-900">
                    {item.value}
                  </Paragraph>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start gap-2 mb-2">
                  <item.icon className="w-5 h-5 text-[#F4781B]" />
                </div>
                <Paragraph size="xs" className="text-gray-500 mb-1">{item.label}</Paragraph>
                <Paragraph size="lg" weight="semibold" className="text-xl text-gray-900">
                  {item.value}
                </Paragraph>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Bug 5 fix — .trim() so empty string doesn't silently skip */}
      {job.description?.trim() ? (
        <div className="mb-5 pb-5 border-b border-gray-200">
          <Heading as="h3" size="xs" weight="semibold" className="text-sm text-[#F4781B] mb-3">
            Description :
          </Heading>
          <ResponsiveParagraph size="xs" className="text-[#717680] leading-relaxed whitespace-pre-wrap">
            {job.description}
          </ResponsiveParagraph>
        </div>
      ) : null}

      {normalJob?.specializations && normalJob.specializations.length > 0 && (
        <div className="mb-5 pb-5 border-b border-gray-200">
          <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-3">
            Specialization :
          </Heading>
          <div className="flex flex-wrap gap-2">
           {normalJob.specializations.map((spec) => (
            <span key={spec} className="px-3 py-2 bg-[#FAFAFA] text-xs rounded-sm border-2 font-medium">
              {convertSpecializationToFrontend(String(spec))}
            </span>
            ))}
          </div>
        </div>
      )}

      {normalJob?.qualifications && normalJob.qualifications.length > 0 && (
        <div className="mb-5 pb-5 border-b border-gray-200">
          <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-3">
            Qualification :
          </Heading>
          <div className="flex flex-wrap gap-2">
            {normalJob.qualifications.map((qual) => (
              <span
                key={qual}
                className="px-3 py-2 bg-[#FAFAFA] text-xs rounded-sm border-2 font-medium"
              >
                {convertQualificationToFrontend(qual)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interview Questions */}
      {interviewQuestions.length > 0 && (
        <div className="mb-5 pb-5 border-b border-gray-200">
          <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-4">
            Interview Questions :
          </Heading>
          <div className="space-y-4">
            {interviewQuestions.map((topic, topicIdx) => (
              <div key={topicIdx}>
                <Paragraph size="sm" weight="semibold" className="text-gray-900 mb-2">
                  {topic.topic}
                </Paragraph>
                {topic.questions.length > 0 ? (
                  <ol className="space-y-1 ml-4">
                    {topic.questions.map((question: string, qIdx: number) => (
                      <li key={qIdx} className="leading-relaxed">
                        <ResponsiveParagraph size="xs" className="text-[#717680]">
                          <span className="font-semibold">{qIdx + 1}.</span> {question}
                        </ResponsiveParagraph>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <Paragraph size="xs" className="text-gray-400 italic ml-4">
                    No questions added yet
                  </Paragraph>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instant Job Schedule */}
      {instantJob && (job.start_date || job.check_in_time) && (
  <div className="mb-5 pb-5 border-b border-gray-200">
    <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-3">
      Schedule :
    </Heading>
    <div className="grid grid-cols-2 gap-4 text-sm">
      {job.start_date && (
        <div>
          <Paragraph size="xs" className="text-gray-500 mb-1">From Date</Paragraph>
          <Paragraph size="sm" weight="semibold" className="text-gray-900">
            {new Date(job.start_date).toLocaleDateString()}
          </Paragraph>
        </div>
      )}
      {job.end_date && (
        <div>
          <Paragraph size="xs" className="text-gray-500 mb-1">Till Date</Paragraph>
          <Paragraph size="sm" weight="semibold" className="text-gray-900">
            {job.start_date &&
             new Date(job.end_date).toDateString() === new Date(job.start_date).toDateString()
              ? `Same Day (${new Date(job.end_date).toLocaleDateString()})`
              : new Date(job.end_date).toLocaleDateString()}
          </Paragraph>
        </div>
      )}
      {job.check_in_time && (
        <div>
          <Paragraph size="xs" className="text-gray-500 mb-1">Check In</Paragraph>
          <Paragraph size="sm" weight="semibold" className="text-gray-900">
            {job.check_in_time}
          </Paragraph>
        </div>
      )}
      {job.check_out_time && (
        <div>
          <Paragraph size="xs" className="text-gray-500 mb-1">Check Out</Paragraph>
          <Paragraph size="sm" weight="semibold" className="text-gray-900">
            {job.check_out_time}
          </Paragraph>
        </div>
      )}
    </div>
  </div>
)}

      {/* Additional Info */}
<div className="mt-6 pt-6 border-t border-gray-200">
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <Paragraph size="xs" className="text-gray-500 mb-1">Urgency</Paragraph>
      <Paragraph size="sm" weight="semibold" className="text-gray-900 capitalize">
        {job.job_urgency === "instant" ? "Instant" : job.job_urgency || "Not specified"}
      </Paragraph>
    </div>

    {/* ✅ Hide AI Interview for instant jobs */}
    {job.job_urgency !== "instant" && (
      <div>
        <Paragraph size="xs" className="text-gray-500 mb-1">AI Interview</Paragraph>
        <Paragraph size="sm" weight="semibold" className="text-gray-900">
          {normalJob?.ai_interview === true
            ? "Yes"
            : normalJob?.ai_interview === false
            ? "No"
            : "Not specified"}
        </Paragraph>
      </div>
    )}

    <div>
      <Paragraph size="xs" className="text-gray-500 mb-1">Number of Hires</Paragraph>
      <Paragraph size="sm" weight="semibold" className="text-gray-900">
        {job.no_of_hires_required || "Not specified"}
      </Paragraph>
    </div>
    <div>
      <Paragraph size="xs" className="text-gray-500 mb-1">Last Updated</Paragraph>
      <Paragraph size="sm" weight="semibold" className="text-gray-900">
        {getTimeAgo(job.updated_at || "")}
      </Paragraph>
    </div>
  </div>
</div>
    </>
  );
};