"use client";

import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  fromDate?:  Date;
  tillDate?:  Date;
  minDate?:   Date;
  onChange:   (from: Date | undefined, till: Date | undefined) => void;
  onCancel:   () => void;
  onSchedule: () => void;
}

export function DateRangePicker({
  fromDate,
  tillDate,
  minDate,
  onChange,
  onCancel,
  onSchedule,
}: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(
    fromDate || tillDate
      ? { from: fromDate, to: tillDate }
      : undefined
  );

  const handleSelect = (selected: DateRange | undefined) => {
    setRange(selected);
    onChange(selected?.from, selected?.to);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-fit">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        numberOfMonths={2}
        disabled={minDate ? { before: minDate } : undefined}
        showOutsideDays
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left"
              ? <ChevronLeft className="h-4 w-4 text-gray-600" />
              : <ChevronRight className="h-4 w-4 text-gray-600" />,
        }}
        classNames={{
          months:               "flex gap-6",
          month:                "space-y-3",
          month_caption:        "flex justify-center items-center h-9 relative",
          caption_label:        "text-sm font-semibold text-gray-900",
          nav:                  "flex items-center gap-1",
          button_previous:      "absolute left-0 p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
          button_next:          "absolute right-0 p-1.5 hover:bg-gray-100 rounded-md transition-colors",
          month_grid:           "w-full border-collapse",
          weekdays:             "flex",
          weekday:              "text-gray-500 text-xs font-medium w-10 h-8 flex items-center justify-center",
          weeks:                "space-y-1",
          week:                 "flex",
          day:                  "p-0",
          day_button: [
            "w-10 h-10 text-sm font-normal rounded-md transition-colors",
            "hover:bg-orange-50 hover:text-[#F4781B]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4781B]",
          ].join(" "),
          selected:             "font-semibold",
          today:                "text-[#F4781B] font-medium",
          outside:              "text-gray-300 opacity-50",
          disabled:             "text-gray-200 cursor-not-allowed pointer-events-none",
          range_start: [
            "[&>button]:bg-[#F4781B] [&>button]:text-white [&>button]:rounded-l-md",
            "[&>button]:rounded-r-none [&>button]:hover:bg-[#e06510]",
          ].join(" "),
          range_end: [
            "[&>button]:bg-[#F4781B] [&>button]:text-white [&>button]:rounded-r-md",
            "[&>button]:rounded-l-none [&>button]:hover:bg-[#e06510]",
          ].join(" "),
          // ✅ In-between dates — lighter orange background like Skyscanner
          range_middle: [
            "[&>button]:bg-orange-100 [&>button]:text-[#c45e0e]",
            "[&>button]:rounded-none [&>button]:hover:bg-orange-200",
          ].join(" "),
          hidden: "invisible",
        }}
      />

      {/* Selected range display */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">From</span>
            <span className={`font-medium ${range?.from ? "text-[#F4781B]" : "text-gray-300"}`}>
              {range?.from
                ? range.from.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "Select start"}
            </span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">To</span>
            <span className={`font-medium ${range?.to ? "text-[#F4781B]" : "text-gray-300"}`}>
              {range?.to
                ? range.to.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "Select end"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100
                       rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSchedule}
            disabled={!range?.from || !range?.to}
            className="px-4 py-2 text-sm font-medium text-white bg-[#F4781B]
                       hover:bg-orange-600 rounded-md transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}