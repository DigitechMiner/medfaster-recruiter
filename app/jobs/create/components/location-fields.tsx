"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobFormData, Province } from "@/Interface/recruiter.types";
import { provinces } from "@/utils/constant/metadata"; // ✅ ADD

interface LocationFieldsProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

export function LocationFields({ formData, updateFormData }: LocationFieldsProps) {
  return (
    <div className="space-y-6 mb-6">
      {/* Street Address & Postal Code */}
    {/* Street Address */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <Label htmlFor="street-address" className="text-sm font-medium text-gray-700">
      Street Address
    </Label>
    <Input
      id="street-address"
      type="text"
      value={formData.streetAddress || ""}
      onChange={(e) => updateFormData({ streetAddress: e.target.value })}
      placeholder="1234 Maple Street"
      className="h-11"
    />
  </div>

  {/* City */}
  <div className="space-y-2">
    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
      City <span className="text-red-500">*</span>
    </Label>
    <Input
      id="city"
      type="text"
      value={formData.city || ""}
      onChange={(e) => updateFormData({ city: e.target.value })}
      placeholder="Toronto"
      className="h-11"
      required
    />
  </div>
</div>

{/* Province, Country, Postal Code */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="space-y-2">
    <Label htmlFor="province" className="text-sm font-medium text-gray-700">
      Province
    </Label>
    <Select
      value={formData.province || ""}
      onValueChange={(value) => updateFormData({ province: value as Province })}
    >
      <SelectTrigger id="province" className="h-11 border-[#F4781B]">
        <SelectValue placeholder="Select Province" />
      </SelectTrigger>
      <SelectContent>
        {provinces.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
      Country <span className="text-red-500">*</span>
    </Label>
    <Input
      id="country"
      type="text"
      value={formData.country || "Canada"}
      disabled
      className="h-11 bg-gray-50 text-gray-500"
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="postal-code" className="text-sm font-medium text-gray-700">
      Postal Code <span className="text-red-500">*</span>
    </Label>
    <Input
      id="postal-code"
      type="text"
      value={formData.postalCode || ""}
      onChange={(e) => updateFormData({ postalCode: e.target.value })}
      placeholder="M5H 2N2"
      className="h-11"
      required
    />
  </div>
</div>
    </div>
  );
}
