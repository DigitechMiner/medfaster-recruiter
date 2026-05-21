"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

type DateEditMode = "start" | "end";

interface DateRangePickerProps {
  fromDate?: Date;
  tillDate?: Date;
  minDate?: Date;
  editMode: DateEditMode;
  onChange: (from: Date | undefined, till: Date | undefined) => void;
  onCancel: () => void;
  onApply: () => void;
}

export function DateRangePicker({
  fromDate,
  tillDate,
  minDate,
  editMode,
  onChange,
  onCancel,
  onApply,
}: DateRangePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(
    editMode === "start" ? fromDate : tillDate,
  );

  const handleSelect = (day?: Date) => {
    setSelected(day);

    if (editMode === "start") {
      onChange(day, tillDate);
    } else {
      onChange(fromDate, day);
    }
  };

  const label = editMode === "start" ? "Start Date" : "End Date";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-fit">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        disabled={minDate ? { before: minDate } : undefined}
        showOutsideDays
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ),
        }}
        classNames={{
          months: "flex",
          month: "space-y-3",
          month_caption: "flex justify-center items-center h-9 relative",
          caption_label: "text-sm font-semibold text-gray-900",
          nav: "flex items-center gap-1",
          button_previous:
            "absolute left-0 p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
          button_next:
            "absolute right-0 p-1.5 hover:bg-gray-100 rounded-md transition-colors",
          month_grid: "w-full border-collapse",
          weekdays: "flex",
          weekday:
            "text-gray-500 text-xs font-medium w-10 h-8 flex items-center justify-center",
          weeks: "space-y-1",
          week: "flex",
          day: "p-0",
          day_button: [
            "w-10 h-10 text-sm font-normal rounded-md transition-colors",
            "hover:bg-orange-50 hover:text-[#F4781B]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4781B]",
          ].join(" "),
          selected:
            "font-semibold bg-[#F4781B] text-white hover:bg-[#e06510] [&>span]:text-white",
          today: "text-[#F4781B] font-medium",
          outside: "text-gray-300 opacity-50",
          disabled: "text-gray-200 cursor-not-allowed pointer-events-none",
          hidden: "invisible",
        }}
      />

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex flex-col text-sm text-gray-600">
          <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">
            {label}
          </span>
          <span
            className={`font-medium ${
              selected ? "text-[#F4781B]" : "text-gray-300"
            }`}
          >
            {selected
              ? selected.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : editMode === "start"
              ? "Select start date"
              : "Select end date"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={!selected}
            className="px-4 py-2 text-sm font-medium text-white bg-[#F4781B] hover:bg-orange-600 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}