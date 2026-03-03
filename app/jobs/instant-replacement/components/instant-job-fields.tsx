// app/jobs/instant-replacement/components/instant-job-fields.tsx
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomCalendar } from "../../components/custom-calendar";
import { CustomTimePicker } from "../../components/custom-time-picker";

interface InstantJobFormData {
  numberOfHires?: string;
  amountPerHire?: string;
  fromDate?: Date;
  tillDate?: Date;
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
  updateFormData: (updates: Partial<InstantJobFormData>) => void;
}

export function InstantJobFields({ formData, updateFormData }: InstantJobFieldsProps) {
  const [showCalendar1, setShowCalendar1] = useState(false);
  const [showCalendar2, setShowCalendar2] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const today = new Date();
  const tillMinDate = new Date(today);
  tillMinDate.setDate(today.getDate() + 1);

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
            className="h-11"
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
            className="h-11"
            required
          />
        </div>
      </div>

      {/* From Date, Till Date, Check In, Check Out */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            From Date <span className="text-red-500">*</span>
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
            Till Date <span className="text-red-500">*</span>
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Check In Time <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => setShowCheckInPicker(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
          >
            <span className="text-gray-600">{formatTimeDisplay(formData.checkInTime)}</span>
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Check Out Time <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => setShowCheckOutPicker(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
          >
            <span className="text-gray-600">{formatTimeDisplay(formData.checkOutTime)}</span>
          </button>
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
            className="h-11"
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
            <SelectTrigger className="h-11">
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
            className="h-11"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Street Address</Label>
          <Input
            value={formData.streetAddress}
            onChange={(e) => updateFormData({ streetAddress: e.target.value })}
            placeholder="1234 Maple Street"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.postalCode}
            onChange={(e) => updateFormData({ postalCode: e.target.value })}
            placeholder="M5H 2N2"
            className="h-11"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Province</Label>
          <Select
            value={formData.province}
            onValueChange={(v) => updateFormData({ province: v })}
          >
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Ontario (ON)">Ontario (ON)</SelectItem>
              <SelectItem value="British Columbia (BC)">British Columbia (BC)</SelectItem>
              <SelectItem value="Alberta (AB)">Alberta (AB)</SelectItem>
              <SelectItem value="Quebec (QC)">Quebec (QC)</SelectItem>
              <SelectItem value="Saskatchewan (SK)">Saskatchewan (SK)</SelectItem>
              <SelectItem value="Manitoba (MB)">Manitoba (MB)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Country</Label>
          <Input value={formData.country} disabled className="h-11 bg-gray-50 text-gray-500" />
        </div>
      </div>

      {/* Modals */}
      {showCalendar1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomCalendar
            selectedDate={formData.fromDate}
            onSelect={(date) => updateFormData({ fromDate: date })}
            onCancel={() => setShowCalendar1(false)}
            onSchedule={() => setShowCalendar1(false)}
            minDate={today}
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

      {showCheckInPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.checkInTime}
            onSelect={(time) => updateFormData({ checkInTime: time })}
            onCancel={() => setShowCheckInPicker(false)}
            onSelectTime={() => setShowCheckInPicker(false)}
          />
        </div>
      )}

      {showCheckOutPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.checkOutTime}
            onSelect={(time) => updateFormData({ checkOutTime: time })}
            onCancel={() => setShowCheckOutPicker(false)}
            onSelectTime={() => setShowCheckOutPicker(false)}
          />
        </div>
      )}
    </>
  );
}
