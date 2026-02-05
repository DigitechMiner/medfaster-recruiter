// app/jobs/create/components/job-basic-info.tsx
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
  const [showCalendar1, setShowCalendar1] = useState(false);
  const [showCalendar2, setShowCalendar2] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return "DD/MM/YYYY";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
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
        {/* Department & Job Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) => updateFormData({ department: value })}
            >
              <SelectTrigger
                id="department"
                className="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
              >
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-title" className="text-sm font-medium text-gray-700">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.jobTitle}
              onValueChange={(value) => updateFormData({ jobTitle: value })}
            >
              <SelectTrigger
                id="job-title"
                className="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
              >
                <SelectValue placeholder="Nurse" />
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

        {/* Number of Hires, Till Date 1, Till Date 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Number of hires for this position <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.numberOfHires || "5"}
              onChange={(e) => updateFormData({ numberOfHires: e.target.value })}
              placeholder="5"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Till Date</Label>
            <button
              type="button"
              onClick={() => setShowCalendar1(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">{formatDate(formData.tillDate1)}</span>
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Till Date</Label>
            <button
              type="button"
              onClick={() => setShowCalendar2(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
            >
              <span className="text-gray-600">{formatDate(formData.tillDate2)}</span>
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Job Type, From Time, To Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Job Type <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.jobType}
              onValueChange={(value) => updateFormData({ jobType: value })}
              className="flex gap-6 pt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Part Time"
                  id="part-time"
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label htmlFor="part-time" className="font-normal cursor-pointer text-sm text-gray-700">
                  Part Time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Full Time"
                  id="full-time"
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label htmlFor="full-time" className="font-normal cursor-pointer text-sm text-gray-700">
                  Full-Time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Casual"
                  id="casual"
                  className="border-[#F4781B] text-white data-[state=checked]:bg-[#F4781B] data-[state=checked]:border-[#F4781B]"
                />
                <Label htmlFor="casual" className="font-normal cursor-pointer text-sm text-gray-700">
                  Casual
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* From Time with Clock Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              From Time <span className="text-red-500">*</span>
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

          {/* To Time with Clock Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              To Time <span className="text-red-500">*</span>
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

      {/* Modals */}
      {showCalendar1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={formData.tillDate1}
            onSelect={(date) => updateFormData({ tillDate1: date })}
            onCancel={() => setShowCalendar1(false)}
            onSchedule={() => setShowCalendar1(false)}
          />
        </div>
      )}

      {showCalendar2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={formData.tillDate2}
            onSelect={(date) => updateFormData({ tillDate2: date })}
            onCancel={() => setShowCalendar2(false)}
            onSchedule={() => setShowCalendar2(false)}
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
