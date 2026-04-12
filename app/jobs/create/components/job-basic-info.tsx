"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import metadata from "@/utils/constant/metadata";
import { JobFormData } from "../../components/JobForm";
import { CustomCalendar } from "../../components/custom-calendar";
import { CustomTimePicker } from "../../components/custom-time-picker";

const JOB_TITLES = metadata.job_title;
const DEPARTMENTS = metadata.department;

interface JobBasicInfoProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

export function JobBasicInfo({ formData, updateFormData }: JobBasicInfoProps) {
  const isInstant = formData.urgency === "instant";

  const today = new Date();
  const fromMinDate = today;
  const tillMinDate = new Date(today);
  tillMinDate.setDate(today.getDate() + 1);

  const [showCalendar1, setShowCalendar1] = useState(false);
  const [showCalendar2, setShowCalendar2] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  const formatDate = (date?: Date | string) => {
    if (!date) return "MM/DD/YYYY";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "MM/DD/YYYY";
    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeDisplay = (time?: string) => {
    if (!time) return "7:30 am";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <>
      <div className="space-y-6 mb-6">

        {/* Row 1: Department & Job Title / Job Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) => updateFormData({ department: value })}
            >
              <SelectTrigger id="department" className="w-full border-[#F4781B] focus:ring-[#F4781B] h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {isInstant ? "Job Role" : "Job Title"} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.jobTitle}
              onValueChange={(value) => updateFormData({ jobTitle: value })}
            >
              <SelectTrigger id="job-title" className="w-full border-[#F4781B] focus:ring-[#F4781B] h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TITLES.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Normal only — Requirements + Job Type & Interview */}
        {!isInstant && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Requirements For This Position <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.numberOfHires || ""}
                onChange={(e) => updateFormData({ numberOfHires: e.target.value })}
                placeholder="5"
                className="h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.jobType}
                  onValueChange={(value) => updateFormData({ jobType: value })}
                  className="flex gap-4 pt-2"
                >
                  {["Part Time", "Full Time"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={type}
                        id={type.toLowerCase().replace(" ", "-")}
                        className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                      />
                      <Label
                        htmlFor={type.toLowerCase().replace(" ", "-")}
                        className="font-normal cursor-pointer text-sm text-gray-700"
                      >
                        {type === "Full Time" ? "Full-Time" : type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Do you admire to have Interview? <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.inPersonInterview}
                  onValueChange={(value) => updateFormData({ inPersonInterview: value })}
                  className="flex gap-4 pt-2"
                >
                  {["Yes", "No"].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={opt}
                        id={`interview-${opt.toLowerCase()}`}
                        className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                      />
                      <Label
                        htmlFor={`interview-${opt.toLowerCase()}`}
                        className="font-normal cursor-pointer text-sm text-gray-700"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Start Date & End Date — both */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {isInstant ? "Shift Start Date" : "Job Start Date"} <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowCalendar1(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">{formatDate(formData.fromDate)}</span>
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {isInstant ? "Shift End Date" : "Job End Date"} <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowCalendar2(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">{formatDate(formData.tillDate)}</span>
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Row 4: Check-In & Check-Out Time — both */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {isInstant ? "Shift Check-In Time" : "Job Check-In Time"} <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowFromTimePicker(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">{formatTimeDisplay(formData.fromTime)}</span>
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {isInstant ? "Shift Check-Out Time" : "Job Check-Out Time"} <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowToTimePicker(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">{formatTimeDisplay(formData.toTime)}</span>
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {showCalendar1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={formData.fromDate}
            onSelect={(date) => updateFormData({ fromDate: date })}
            onCancel={() => setShowCalendar1(false)}
            onSchedule={() => setShowCalendar1(false)}
            minDate={fromMinDate}
          />
        </div>
      )}

      {showCalendar2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={formData.tillDate}
            onSelect={(date) => updateFormData({ tillDate: date })}
            onCancel={() => setShowCalendar2(false)}
            onSchedule={() => setShowCalendar2(false)}
            minDate={tillMinDate}
          />
        </div>
      )}

      {showFromTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.fromTime}
            onSelect={(time) => updateFormData({ fromTime: time })}
            onCancel={() => setShowFromTimePicker(false)}
            onSelectTime={() => setShowFromTimePicker(false)}
          />
        </div>
      )}

      {showToTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.toTime}
            onSelect={(time) => updateFormData({ toTime: time })}
            onCancel={() => setShowToTimePicker(false)}
            onSelectTime={() => setShowToTimePicker(false)}
          />
        </div>
      )}
    </>
  );
}