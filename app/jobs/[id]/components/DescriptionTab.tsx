import type { JobBackendResponse } from "@/types";

type DescriptionTabProps = {
  job: JobBackendResponse;
};

export function DescriptionTab({ job }: DescriptionTabProps) {
  const sections = [
    { title: "Responsibilities", items: job.responsibilities },
    { title: "Required Skills", items: job.required_skills },
    { title: "Experience", items: job.experience },
    { title: "Working Conditions", items: job.working_conditions },
    { title: "Why Join", items: job.why_join },
  ];

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h3>
        <p className="text-sm text-gray-500 leading-6 whitespace-pre-line">
          {job.description?.trim() || "N/A"}
        </p>
      </section>
      {sections.map((section) => (
        <section key={section.title} className="rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h3>
          {section.items.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
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
