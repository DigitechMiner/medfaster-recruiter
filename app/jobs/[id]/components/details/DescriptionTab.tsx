"use client";

import { useJobDescription } from "@/hooks/useJobData";
import { useMetadataStore } from "@/stores/metadataStore";
import { getMetadataLabel } from "@/utils/constant/metadata";
import { ChildJobsSection } from "../shared/ChildJobsSection";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";

type DescriptionTabProps = {
  jobId: string;
  enabled?: boolean;
  showChildJobs?: boolean;
};

export function DescriptionTab({
  jobId,
  enabled = true,
  showChildJobs = false,
}: DescriptionTabProps) {
  const { description, isLoading, error } = useJobDescription(jobId, enabled);
  const specializationOptions = useMetadataStore((state) => state.specializations);

  if (isLoading) {
    return <LoadingRows count={4} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load job description"
        description={error}
      />
    );
  }

  const sections = [
    {
      title: "Specializations",
      items: (description?.specializations ?? []).map(
        (item) => getMetadataLabel(specializationOptions, item) || item,
      ),
    },
    { title: "Responsibilities", items: description?.responsibilities ?? [] },
    { title: "Requirements", items: description?.requirements ?? [] },
    {
      title: "Required Skills",
      items: description?.skills ?? description?.required_skills ?? [],
    },
    { title: "Experience", items: description?.experience ?? [] },
    { title: "Working Conditions", items: description?.working_conditions ?? [] },
    { title: "Why Join", items: description?.why_join ?? [] },
  ];

  return (
    <div className="flex flex-col gap-5">
      {showChildJobs ? (
        <ChildJobsSection
          jobId={jobId}
          enabled={enabled}
          title="Instant shifts"
        />
      ) : null}
      <section className="rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Job Description
        </h3>
        <p className="text-sm text-gray-500 leading-6 whitespace-pre-line">
          {description?.description?.trim() || "N/A"}
        </p>
      </section>
      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {section.title}
          </h3>
          {section.items.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-gray-500"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#F4781B] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">N/A</p>
          )}
        </section>
      ))}
    </div>
  );
}
