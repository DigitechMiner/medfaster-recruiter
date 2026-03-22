"use client";

const locations = [
  { label: "Within\nTown",    applications: 140, hires: 25, conversion: "18%", appPct: 100, hirePct: 18 },
  { label: "Within\nCity",    applications: 85,  hires: 15, conversion: "17%", appPct: 61,  hirePct: 11 },
  { label: "Nearby\nCities",  applications: 12,  hires: 4,  conversion: "33%", appPct: 9,   hirePct: 3  },
];

const GridLines = () => (
  <div className="absolute inset-0 flex pointer-events-none">
    {[25, 50, 75, 100].map((p) => (
      <div
        key={p}
        className="absolute top-0 bottom-0 border-l border-dashed border-gray-200"
        style={{ left: `${p}%` }}
      />
    ))}
  </div>
);

export const LocationInsights = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900">Location-Based Hiring Insights</h2>
      <select className="text-sm border border-gray-200 rounded-xl px-4 py-2 text-gray-700 bg-white focus:outline-none">
        <option>Lowest Hires</option>
        <option>Highest Hires</option>
      </select>
    </div>

    {/* Bars */}
    <div className="px-6 py-6 flex flex-col gap-6">
      {locations.map((loc) => (
        <div key={loc.label} className="flex items-center gap-4">
          {/* Label */}
          <span className="text-sm text-gray-400 w-16 shrink-0 whitespace-pre-line leading-snug">
            {loc.label}
          </span>

          {/* Bars */}
          <div className="flex-1 relative flex flex-col gap-2">
            <GridLines />

            {/* Applications bar (blue) */}
            <div className="relative h-9 rounded-r-lg overflow-hidden bg-transparent">
              <div
                className="h-full bg-blue-500 rounded-r-lg flex items-center px-3"
                style={{ width: `${loc.appPct}%` }}
              >
                <span className="text-sm font-bold text-white">{loc.applications}</span>
              </div>
            </div>

            {/* Hires bar (orange) */}
            <div className="relative h-9 rounded-r-lg overflow-hidden bg-transparent">
              <div
                className="h-full bg-orange-500 rounded-r-lg flex items-center px-3"
                style={{ width: `${loc.hirePct}%` }}
              >
                <span className="text-sm font-bold text-white">{loc.hires}</span>
              </div>
            </div>
          </div>

          {/* Conversion — aligned to right of blue bar */}
          <span className="text-sm text-green-600 whitespace-nowrap w-32 shrink-0">
            Conversion: <span className="font-bold">{loc.conversion}</span>
          </span>
        </div>
      ))}
    </div>

    {/* Legend */}
    <div className="flex gap-6 px-6 pb-5">
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <span className="w-4 h-4 rounded bg-blue-500 inline-block" /> Applications
      </span>
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <span className="w-4 h-4 rounded bg-orange-500 inline-block" /> Hires
      </span>
    </div>
  </div>
);
