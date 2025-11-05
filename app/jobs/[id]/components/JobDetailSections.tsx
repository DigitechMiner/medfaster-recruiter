"use client";

import React from "react";
import Image from "next/image";
import { TopJob } from "@/Interface/job.types";
import {
  Clock,
  MapPin,
  Briefcase,
  Timer,
  DollarSign,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { Paragraph, ResponsiveParagraph } from "@/components/custom/paragraph";
import { Heading } from "@/components/custom/heading";

interface JobDetailSectionsProps {
  job: TopJob;
  jobDetails: {
    info: {
      hospitalIcon: string;
      hospitalName: string;
      jobTitle: string;
    };
    grid: {
      location: string;
      experience: string;
      jobType: string;
      salary: string;
    };
    contact: {
      email: string;
      phone: string;
      website: string;
    };
    content: {
      description: string;
      specializations: string[];
      qualifications: string[];
      interviewQuestions: {
        topic: string;
        questions: string[];
      }[];
    };
  };
}

export const JobDetailSections: React.FC<JobDetailSectionsProps> = ({
  job,
  jobDetails,
}) => {
  const { info, grid, contact, content } = jobDetails;

  // Grid items data
  const gridItems = [
    {
      icon: MapPin,
      label: "Location",
      value: grid.location,
    },
    {
      icon: Briefcase,
      label: "Experience Required",
      value: grid.experience,
    },
    {
      icon: Timer,
      label: "Job Type",
      value: grid.jobType,
    },
    {
      icon: DollarSign,
      label: "Salaries",
      value: grid.salary,
    },
  ];

  // Contact items data
  const contactItems = [
    {
      icon: Mail,
      value: contact.email,
    },
    {
      icon: Phone,
      value: contact.phone,
    },
    {
      icon: Globe,
      value: contact.website,
    },
  ];

  return (
    <>
      {/* Job Detail Info */}
      <div className="mb-6 gap-4 flex flex-col">
        <div className="flex justify-between">
          <Image
            src={info.hospitalIcon}
            alt="hospital"
            width={80}
            height={80}
            className="rounded-lg p-2 border border-gray-200 flex-shrink-0"
          />

          <Paragraph size="xs" className="text-gray-600">
            {job.applicantCount} applied
          </Paragraph>
        </div>

        <div className="flex-1">
          <Paragraph
            size="xs"
            className="text-gray-500 mb-0.5 flex items-center gap-1"
          >
            <Clock className="w-4 h-4 text-[#F4781B]" />
            {job.postedDaysAgo} min ago
          </Paragraph>
          <ResponsiveParagraph
            size="base"
            className="font-semibold text-gray-900 mb-0.5"
          >
            Job Title : {info.jobTitle}
          </ResponsiveParagraph>
          <ResponsiveParagraph size="xs" className="text-gray-600">
            {info.hospitalName}
          </ResponsiveParagraph>
        </div>
      </div>

      {/* Job Detail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-6 pb-2 border-b border-gray-200">
        {gridItems.map((item, index) => (
          <div
            key={index}
            className={`${
              index === 0
                ? "pr-4 border-r border-gray-200 sm:border-r"
                : index === gridItems.length - 1
                ? "pl-4"
                : "px-4 border-r border-gray-200 sm:border-r"
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

      {/* Job Detail Contact */}
      <div className="mb-5 pb-5 border-b border-gray-200 space-y-2">
        {contactItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <item.icon className="w-4 h-4 text-[#F4781B]" />
            <ResponsiveParagraph size="xs" className="text-gray-700">
              {item.value}
            </ResponsiveParagraph>
          </div>
        ))}
      </div>

      {/* Job Detail Content */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        <Heading as="h3" size="xs" weight="semibold" className="text-sm text-[#F4781B] mb-3">
          Description :
        </Heading>
        <ResponsiveParagraph size="xs" className="text-[#717680] leading-relaxed">
          {content.description}
        </ResponsiveParagraph>
      </div>

      <div className="mb-5 pb-5 border-b border-gray-200">
        <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-3">
          Specialization :
        </Heading>
        <div className="flex flex-wrap gap-2">
          {content.specializations.map((spec, idx) => (
            <span
              key={idx}
              className="px-3 py-2 bg-[#FAFAFA] text-xs rounded-sm border-2 font-medium"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5 pb-5 border-b border-gray-200">
        <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-3">
          Qualification :
        </Heading>
        <div className="flex flex-wrap gap-2">
          {content.qualifications.map((qual, idx) => (
            <span
              key={idx}
              className="px-3 py-2 bg-[#FAFAFA] text-xs rounded-sm border-2 font-medium"
            >
              {qual}
            </span>
          ))}
        </div>
      </div>

      <div>
        <Heading as="h3" size="xs" weight="semibold" className="text-sm text-orange-600 mb-4">
          Interview Questions :
        </Heading>
        <div className="space-y-4">
          {content.interviewQuestions.map((topic, topicIdx) => (
            <div key={topicIdx}>
              <Paragraph size="sm" weight="semibold" className="text-gray-900 mb-2">
                {topic.topic}
              </Paragraph>
              <ol className="space-y-1 ml-4">
                {topic.questions.map((question, qIdx) => (
                  <li key={qIdx} className="leading-relaxed">
                    <ResponsiveParagraph size="xs" className="text-[#717680]">
                      <span className="font-semibold">{qIdx + 1}.</span>{" "}
                      {question}
                    </ResponsiveParagraph>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

