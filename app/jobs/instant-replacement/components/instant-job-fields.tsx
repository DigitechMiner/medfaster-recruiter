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
import { provinces } from "@/utils/constant/metadata";
import type { JobFormData } from "@/Interface/job.types";

const NEIGHBOURHOOD_TYPES = [
  { value: "independent_living", label: "Independent Living" },
  { value: "assisted_living", label: "Assisted Living" },
  { value: "dementia_or_memory_care", label: "Dementia / Memory Care" },
  { value: "complex_dementia_care", label: "Complex Dementia Care" },
  { value: "adult_mental_health", label: "Adult Mental Health" },
];

interface InstantJobFormData extends JobFormData {
  numberOfHires?: string;
  amountPerHire?: string;
  neighborhoodName?: string;
  neighborhoodType?: string;
  directNumber?: string;
}

interface InstantJobFieldsProps {
  formData: InstantJobFormData;
  updateFormData: (updates: Partial<InstantJobFormData>) => void;
}

export function InstantJobFields({
  formData,
  updateFormData,
}: InstantJobFieldsProps) {
  return (
    <div className="space-y-6 mb-6">

      {/* Row 1: Requirements & Hourly Pay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="no-of-hires" className="text-sm font-medium text-gray-700">
            Requirements For This Position <span className="text-red-500">*</span>
          </Label>
          <Input
            id="no-of-hires"
            type="number"
            value={formData.numberOfHires || ""}
            onChange={(e) => updateFormData({ numberOfHires: e.target.value })}
            placeholder="5"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-per-hire" className="text-sm font-medium text-gray-700">
            Hourly Pay per Hire
          </Label>
          <Input
            id="amount-per-hire"
            type="text"
            value={formData.amountPerHire || ""}
            onChange={(e) => updateFormData({ amountPerHire: e.target.value })}
            placeholder="$ 50"
            className="h-11"
          />
        </div>
      </div>

      {/* Row 2: Name of Neighborhood & Type of Neighbourhood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="neighborhood-name" className="text-sm font-medium text-gray-700">
            Name of Neighborhood
          </Label>
          <Input
            id="neighborhood-name"
            type="text"
            value={formData.neighborhoodName || ""}
            onChange={(e) => updateFormData({ neighborhoodName: e.target.value })}
            placeholder="Enter Neighbourhood Name"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood-type" className="text-sm font-medium text-gray-700">
            Type of Neighbourhood
          </Label>
          <Select
            value={formData.neighborhoodType || ""}
            onValueChange={(value) => updateFormData({ neighborhoodType: value })}
          >
            <SelectTrigger id="neighborhood-type" className="h-11">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {NEIGHBOURHOOD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Street Address & City */}
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

      {/* Row 4: Province & Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="province" className="text-sm font-medium text-gray-700">
            Province <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.province || ""}
            onValueChange={(value) => updateFormData({ province: value })}
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

      {/* Row 5: Country & Direct Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Label htmlFor="direct-number" className="text-sm font-medium text-gray-700">
            Direct Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="direct-number"
            type="tel"
            value={formData.directNumber || ""}
            onChange={(e) => updateFormData({ directNumber: e.target.value })}
            placeholder="123-456-7890"
            className="h-11"
            required
          />
        </div>
      </div>

    </div>
  );
}