// app/jobs/instant-replacement/components/instant-job-fields.tsx
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomCalendar } from "../../components/custom-calendar";

// Define the formData type
interface InstantJobFormData {
  numberOfHires?: string;
  amountPerHire?: string;
  checkInTime?: string;
  checkOutTime?: string;
  neighborhoodName?: string;
  neighborhoodType?: string;
  directNumber?: string;
  streetAddress?: string;
  postalCode?: string;
  province?: string;
  city?: string;
  country?: string;
}

interface InstantJobFieldsProps {
  formData: InstantJobFormData;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  updateFormData: (updates: Partial<InstantJobFormData>) => void;
}

export function InstantJobFields({
  formData,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  updateFormData,
}: InstantJobFieldsProps) {
  const [showCalendar1, setShowCalendar1] = useState(false);
  const [showCalendar2, setShowCalendar2] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return "DD/MM/YYYY";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Number of Hires & Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Number of hires <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            value={formData.numberOfHires}
            onChange={(e) => updateFormData({ numberOfHires: e.target.value })}
            placeholder="5"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Amount per hire <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={formData.amountPerHire}
            onChange={(e) => updateFormData({ amountPerHire: e.target.value })}
            placeholder="50$"
            required
          />
        </div>
      </div>

      {/* Dates & Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => setShowCalendar1(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 ${
              !startDate ? "border-red-300" : "border-gray-300"
            }`}
          >
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className={startDate ? "text-gray-900" : "text-gray-400"}>
              {formatDate(startDate)}
            </span>
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            End Date <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => setShowCalendar2(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 ${
              !endDate ? "border-red-300" : "border-gray-300"
            }`}
          >
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className={endDate ? "text-gray-900" : "text-gray-400"}>
              {formatDate(endDate)}
            </span>
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Check In <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="time"
              value={formData.checkInTime}
              onChange={(e) => updateFormData({ checkInTime: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Check Out <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="time"
              value={formData.checkOutTime}
              onChange={(e) => updateFormData({ checkOutTime: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Neighborhood */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Neighborhood Name</Label>
          <Input
            value={formData.neighborhoodName}
            onChange={(e) => updateFormData({ neighborhoodName: e.target.value })}
            placeholder="Type here"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Neighborhood Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.neighborhoodType}
            onValueChange={(value) => updateFormData({ neighborhoodType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Independent Living">Independent Living</SelectItem>
              <SelectItem value="Assisted living">Assisted living</SelectItem>
              <SelectItem value="Dementia / Memory Care">Dementia / Memory Care</SelectItem>
              <SelectItem value="Long-term care">Long-term care</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Direct Number</Label>
          <Input
            value={formData.directNumber}
            onChange={(e) => updateFormData({ directNumber: e.target.value })}
            placeholder="265536727"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Street Address</Label>
          <Input
            value={formData.streetAddress}
            onChange={(e) => updateFormData({ streetAddress: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Postal Code <span className="text-red-500">*</span></Label>
          <Input
            value={formData.postalCode}
            onChange={(e) => updateFormData({ postalCode: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Province</Label>
          <Select value={formData.province} onValueChange={(v) => updateFormData({ province: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Ontario (ON)">Ontario (ON)</SelectItem>
              <SelectItem value="British Columbia (BC)">British Columbia (BC)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City <span className="text-red-500">*</span></Label>
          <Input value={formData.city} onChange={(e) => updateFormData({ city: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input value={formData.country} disabled />
        </div>
      </div>

      {/* Calendars */}
      {showCalendar1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={startDate}
            onSelect={onStartDateChange}
            onCancel={() => setShowCalendar1(false)}
            onSchedule={() => setShowCalendar1(false)}
          />
        </div>
      )}
      {showCalendar2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={endDate}
            onSelect={onEndDateChange}
            onCancel={() => setShowCalendar2(false)}
            onSchedule={() => setShowCalendar2(false)}
          />
        </div>
      )}
    </>
  );
}
