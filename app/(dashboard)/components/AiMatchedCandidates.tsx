"use client";
import { useRouter } from "next/navigation";

const aiCandidates = [
  { name: "Dr. Marvin McKinney", experience: "5+ yrs", company: "Medfasterrr", type: "Part-Time", score: 80 },
  { name: "Dr. Brooklyn Simmons", experience: "2.5+ yrs", company: "Canadian Health", type: "Freelancer", score: 62 },
  { name: "Dr. Cody Fisher", experience: "4+ yrs", company: "Medical Canada", type: "Full-Time", score: 52 },
  { name: "Dr. Darrell Steward", experience: "3+ yrs", company: "Canada Med.", type: "Part-Time", score: 90 },
];

export const AiMatchedCandidates = () => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Recent AI-Matched Candidates</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              {["Candidate Name", "Work Experience", "Current Company", "Job Type", "Overall Score ↑", "Action"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {aiCandidates.map((c) => (
              <tr key={c.name} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="font-medium text-gray-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.experience}</td>
                <td className="px-4 py-3 text-gray-600">{c.company}</td>
                <td className="px-4 py-3 text-gray-600">{c.type}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${c.score >= 80 ? "text-green-600" : c.score >= 60 ? "text-orange-500" : "text-red-500"}`}>
                    {c.score}/100
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => router.push(`/candidates/${c.name}`)}
                    className="text-orange-500 hover:underline text-xs font-medium"
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
