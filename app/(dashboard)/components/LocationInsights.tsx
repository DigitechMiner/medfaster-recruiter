"use client";

const locations = [
  { branch: "Mumbai\nbranch", applications: 140, hires: 25, conversionLabel: "Conversation: 18%" },
  { branch: "Bangalore\nBranch", applications: 85, hires: 15, conversionLabel: "Conversation: 17%" },
  { branch: "Delhi\nBranch", applications: 12, hires: 4, conversionLabel: "Conversation: 33%" },
];

const maxVal = 140;

export const LocationInsights = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-base font-semibold text-gray-900">Location-Based Hiring Insights</h2>
      <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
        <option>Lowest Hires</option>
      </select>
    </div>

    <div className="flex flex-col gap-6">
      {locations.map((loc) => (
        <div key={loc.branch} className="flex items-center gap-4">
          {/* Branch label on left */}
          <span className="text-xs text-gray-500 w-16 shrink-0 whitespace-pre-line leading-tight">
            {loc.branch}
          </span>

          {/* Bars container */}
          <div className="flex-1 flex flex-col gap-1">
            {/* Applications bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full flex items-center pl-2"
                  style={{ width: `${(loc.applications / maxVal) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{loc.applications}</span>
                </div>
              </div>
              <span className="text-xs text-blue-500 w-32 shrink-0">{loc.conversionLabel}</span>
            </div>

            {/* Hires bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full flex items-center pl-2"
                  style={{ width: `${(loc.hires / maxVal) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{loc.hires}</span>
                </div>
              </div>
              <span className="w-32 shrink-0" /> {/* spacer to align with label above */}
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="flex gap-4 mt-5">
      <span className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Applications
      </span>
      <span className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Hires
      </span>
    </div>
  </div>
);
