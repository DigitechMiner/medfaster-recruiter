"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const aiCandidates = [
  { name: "Dr. Marvin McKinney",   experience: "5+ yrs",  company: "Medfasterrr",     type: "Part-Time",  score: 80,  img: "/img/candidates/1.png" },
  { name: "Dr. Brooklyn Simmons",  experience: "2.5+ yrs", company: "Canadian Health", type: "Freelancer", score: 62,  img: "/img/candidates/2.png" },
  { name: "Dr. Cody Fisher",       experience: "4+ yrs",  company: "Medical Canada",  type: "Full-Time",  score: 52,  img: "/img/candidates/3.png" },
  { name: "Dr. Darrell Steward",   experience: "3+ yrs",  company: "Canada Med.",     type: "Part-Time",  score: 90,  img: "/img/candidates/4.png" },
];

export const AiMatchedCandidates = () => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Recent AI-Matched Candidates for Active Jobs
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              {["Candidate Name", "Work Experience", "Current Company", "Job Type", "Overall Score ↓", "Action"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {aiCandidates.map((c) => (
              <tr key={c.name} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {/* Try real image, fallback to initials */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
                      <Image
                        src={c.img}
                        alt={c.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <span className="font-medium text-gray-800 whitespace-nowrap">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.experience}</td>
                <td className="px-4 py-3 text-gray-600">{c.company}</td>
                <td className="px-4 py-3 text-gray-600">{c.type}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold `}>
                    {c.score}/100
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => router.push(`/candidates/${c.name}`)}
                    className="text hover:text-orange-600 font-semibold text-xs"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
