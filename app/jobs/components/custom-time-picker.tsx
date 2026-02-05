// app/jobs/components/custom-time-picker.tsx
"use client";

import { useState } from "react";

interface CustomTimePickerProps {
  selectedTime?: string; // Format: "HH:MM" (24-hour)
  onSelect: (time: string) => void;
  onCancel: () => void;
  onSelectTime: () => void;
}

export function CustomTimePicker({
  selectedTime,
  onSelect,
  onCancel,
  onSelectTime,
}: CustomTimePickerProps) {
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const [hours, setHours] = useState(
    selectedTime ? parseInt(selectedTime.split(":")[0]) : 7
  );
  const [minutes, setMinutes] = useState(
    selectedTime ? parseInt(selectedTime.split(":")[1]) : 30
  );
  const [period, setPeriod] = useState<"AM" | "PM">(
    selectedTime && parseInt(selectedTime.split(":")[0]) >= 12 ? "PM" : "AM"
  );

  // Convert to 12-hour format for display
  const display12Hour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  const handleHourClick = (hour: number) => {
    const adjustedHour = period === "PM" && hour !== 12 ? hour + 12 : hour === 12 && period === "AM" ? 0 : hour;
    setHours(adjustedHour);
    setMode("minutes");
  };

  const handleMinuteClick = (minute: number) => {
    setMinutes(minute);
  };

  const handlePeriodToggle = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    if (newPeriod === "PM" && hours < 12) {
      setHours(hours + 12);
    } else if (newPeriod === "AM" && hours >= 12) {
      setHours(hours - 12);
    }
  };

  const handleSelectTime = () => {
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onSelect(formattedTime);
    onSelectTime();
  };

  const getClockPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90;
    const radius = 100;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  return (
    <div className="w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
      {/* Header */}
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
        Select Time
      </h3>

      {/* Time Display */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {/* Hours */}
        <button
          type="button"
          onClick={() => setMode("hours")}
          className={`w-20 h-20 text-4xl font-semibold rounded-lg transition-all ${
            mode === "hours"
              ? "bg-[#F4781B]/10 text-[#F4781B] border-2 border-[#F4781B]"
              : "bg-gray-100 text-gray-700 border-2 border-transparent"
          }`}
        >
          {display12Hour}
        </button>

        {/* Separator */}
        <span className="text-4xl font-semibold text-gray-700">:</span>

        {/* Minutes */}
        <button
          type="button"
          onClick={() => setMode("minutes")}
          className={`w-20 h-20 text-4xl font-semibold rounded-lg transition-all ${
            mode === "minutes"
              ? "bg-gray-200 text-gray-900 border-2 border-[#F4781B]"
              : "bg-gray-100 text-gray-700 border-2 border-transparent"
          }`}
        >
          {String(minutes).padStart(2, "0")}
        </button>

        {/* AM/PM Toggle */}
        <div className="flex flex-col gap-1 ml-2">
          <button
            type="button"
            onClick={() => handlePeriodToggle("AM")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              period === "AM"
                ? "bg-[#F4781B] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodToggle("PM")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              period === "PM"
                ? "bg-[#F4781B] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock Face */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        {/* Clock Background */}
        <div className="absolute inset-0 bg-gray-100 rounded-full" />

        {/* Clock Numbers */}
        {mode === "hours" ? (
          // Hours (1-12)
          Array.from({ length: 12 }, (_, i) => {
            const hour = i + 1;
            const pos = getClockPosition(i, 12);
            const isSelected = display12Hour === hour;

            return (
              <button
                key={hour}
                type="button"
                onClick={() => handleHourClick(hour)}
                className={`absolute w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[#F4781B] text-white scale-110"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  left: `calc(50% + ${pos.x}px - 20px)`,
                  top: `calc(50% + ${pos.y}px - 20px)`,
                }}
              >
                {hour}
              </button>
            );
          })
        ) : (
          // Minutes (00, 05, 10, ..., 55)
          Array.from({ length: 12 }, (_, i) => {
            const minute = i * 5;
            const pos = getClockPosition(i, 12);
            const isSelected = minutes === minute;

            return (
              <button
                key={minute}
                type="button"
                onClick={() => handleMinuteClick(minute)}
                className={`absolute w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[#F4781B] text-white scale-110"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  left: `calc(50% + ${pos.x}px - 20px)`,
                  top: `calc(50% + ${pos.y}px - 20px)`,
                }}
              >
                {String(minute).padStart(2, "0")}
              </button>
            );
          })
        )}

        {/* Center Dot & Hand */}
        {mode === "hours" && (
          <>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#F4781B] rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
            <div
              className="absolute top-1/2 left-1/2 w-1 bg-[#F4781B] origin-bottom -translate-x-1/2"
              style={{
                height: "80px",
                transform: `translate(-50%, -100%) rotate(${
                  ((display12Hour % 12) * 30 - 90)
                }deg)`,
                transformOrigin: "bottom center",
              }}
            />
            <div
              className="absolute w-10 h-10 bg-[#F4781B] rounded-full"
              style={{
                left: `calc(50% + ${getClockPosition((display12Hour % 12) - 1, 12).x}px - 20px)`,
                top: `calc(50% + ${getClockPosition((display12Hour % 12) - 1, 12).y}px - 20px)`,
              }}
            />
          </>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSelectTime}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#F4781B] hover:bg-orange-600 rounded-md transition-colors"
        >
          Select Time
        </button>
      </div>
    </div>
  );
}
