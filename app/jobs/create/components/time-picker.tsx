"use client";

import { useMemo, useState } from "react";

interface CustomTimePickerProps {
  selectedTime?: string;
  label?: string;
  onSelect: (time: string) => void;
  onCancel: () => void;
  onSelectTime: () => void;
}

export function CustomTimePicker({
  selectedTime,
  label,
  onSelect,
  onCancel,
  onSelectTime,
}: CustomTimePickerProps) {
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const [hours, setHours] = useState(
    selectedTime ? parseInt(selectedTime.split(":")[0]) : 7,
  );
  const [minutes, setMinutes] = useState(
    selectedTime ? parseInt(selectedTime.split(":")[1]) : 30,
  );
  const [period, setPeriod] = useState<"AM" | "PM">(
    selectedTime && parseInt(selectedTime.split(":")[0]) >= 12 ? "PM" : "AM",
  );

  const display12Hour = useMemo(() => {
    return hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  }, [hours]);

  const getClockPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90;
    const radius = 100;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  const handleHourClick = (hour: number) => {
    const adjustedHour =
      period === "PM" && hour !== 12
        ? hour + 12
        : hour === 12 && period === "AM"
        ? 0
        : hour;

    setHours(adjustedHour);
    setMode("minutes");
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
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}`;

    onSelect(formattedTime);
    onSelectTime();
  };

  const hourIndex = display12Hour === 12 ? 0 : display12Hour;
  const hourHandAngle = hourIndex * 30;
  const minuteIndex = minutes / 5;
  const minuteHandAngle = minuteIndex * 30;

  return (
    <div className="w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">
        {label ?? "Select Time"}
      </h3>
      <p className="text-xs text-gray-500 text-center mb-5">
        Tap a number to set hours, then minutes. Use AM/PM to adjust.
      </p>

      <div className="flex items-center justify-center gap-3 mb-8">
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

        <span className="text-4xl font-semibold text-gray-700">:</span>

        <button
          type="button"
          onClick={() => setMode("minutes")}
          className={`w-20 h-20 text-4xl font-semibold rounded-lg transition-all ${
            mode === "minutes"
              ? "bg-[#F4781B]/10 text-[#F4781B] border-2 border-[#F4781B]"
              : "bg-gray-100 text-gray-700 border-2 border-transparent"
          }`}
        >
          {String(minutes).padStart(2, "0")}
        </button>

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

      <div className="relative w-64 h-64 mx-auto mb-8">
        <div className="absolute inset-0 bg-gray-100 rounded-full" />

        {mode === "hours"
          ? Array.from({ length: 12 }, (_, i) => {
              const hour = i === 0 ? 12 : i;
              const pos = getClockPosition(i, 12);
              const isSelected = display12Hour === hour;

              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => handleHourClick(hour)}
                  className={`absolute w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all z-20 ${
                    isSelected
                      ? "bg-[#F4781B] text-white scale-110 shadow-lg"
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
          : Array.from({ length: 12 }, (_, i) => {
              const minute = i * 5;
              const pos = getClockPosition(i, 12);
              const isSelected = minutes === minute;

              return (
                <button
                  key={minute}
                  type="button"
                  onClick={() => setMinutes(minute)}
                  className={`absolute w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all z-20 ${
                    isSelected
                      ? "bg-[#F4781B] text-white scale-110 shadow-lg"
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
            })}

        {mode === "hours" && (
          <>
            <div
              className="absolute top-1/2 left-1/2 w-1 bg-[#F4781B] origin-bottom transition-transform duration-300 z-10"
              style={{
                height: "70px",
                transform: `translate(-50%, -100%) rotate(${hourHandAngle}deg)`,
              }}
            />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#F4781B] rounded-full -translate-x-1/2 -translate-y-1/2 z-30" />
          </>
        )}

        {mode === "minutes" && (
          <>
            <div
              className="absolute top-1/2 left-1/2 w-1 bg-[#F4781B] origin-bottom transition-transform duration-300 z-10"
              style={{
                height: "85px",
                transform: `translate(-50%, -100%) rotate(${minuteHandAngle}deg)`,
              }}
            />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#F4781B] rounded-full -translate-x-1/2 -translate-y-1/2 z-30" />
          </>
        )}
      </div>

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