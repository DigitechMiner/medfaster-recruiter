"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { provinces } from "@/utils/constant/metadata";
import { useMetadataStore } from "@/stores/metadataStore"; // ✅ import store
import type { InstantJobFormData, Province } from "@/Interface/recruiter.types";

const DEFAULT_NEIGHBOURHOOD_TYPES = [
  { value: "independent_living",      label: "Independent Living" },
  { value: "assisted_living",         label: "Assisted Living" },
  { value: "dementia_or_memory_care", label: "Dementia / Memory Care" },
  { value: "complex_dementia_care",   label: "Complex Dementia Care" },
  { value: "adult_mental_health",     label: "Adult Mental Health" },
];

const CDSW_NEIGHBOURHOOD_TYPES = [
  { value: "group_home_community_residential",              label: "Group Home / Community Residential Home" },
  { value: "intermediate_care_developmental_disabilities",  label: "Intermediate Care / Community Care Facility for Developmental Disabilities" },
  { value: "supported_independent_living",                  label: "Supported Independent Living (SIL)" },
  { value: "board_and_care_adult_foster",                   label: "Board-and-Care / Adult Foster Care Homes" },
  { value: "specialized_nursing_homes_disabilities",        label: "Specialized Nursing Homes / Skilled Nursing for Disabilities" },
  { value: "rehabilitation_stepdown_residential",           label: "Rehabilitation and Step-down Residential Care Programs" },
];

interface InstantJobFieldsProps {
  formData: InstantJobFormData;
  updateFormData: (updates: Partial<InstantJobFormData>) => void;
}

export function InstantJobFields({ formData, updateFormData }: InstantJobFieldsProps) {
  // ✅ Get all job titles from store to look up the label for selected jobTitle
  const { jobTitles, departments, jobTitlesForDepartment } = useMetadataStore();

  // ✅ Find the human-readable label of the currently selected job title
  // Check both department-filtered titles and all titles as fallback
  const deptTitles = jobTitlesForDepartment(formData.department ?? "");
  const allTitles  = deptTitles.length ? deptTitles : jobTitles;
  const selectedTitleLabel = allTitles.find(
    (t) => t.value === formData.jobTitle
  )?.label ?? "";

  // ✅ Detect CDSW by label — safe regardless of what slug the API assigns
  const isCDSW =
  selectedTitleLabel.toLowerCase().includes("community disability support worker") ||
  selectedTitleLabel.toUpperCase().includes("CDSW");

  const neighbourhoodTypes = isCDSW
    ? CDSW_NEIGHBOURHOOD_TYPES
    : DEFAULT_NEIGHBOURHOOD_TYPES;

  // ✅ If current neighbourhoodType is no longer valid in the new list, clear it
  const currentTypeValid = neighbourhoodTypes.some(
    (t) => t.value === formData.neighborhoodType
  );
  if (formData.neighborhoodType && !currentTypeValid) {
    updateFormData({ neighborhoodType: "" });
  }

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
            {/* ✅ Visual hint showing which mode is active */}
            {isCDSW && (
              <span className="ml-2 text-[10px] font-semibold text-[#F4781B]
                               bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                CDSW
              </span>
            )}
          </Label>
          <Select
            value={formData.neighborhoodType || ""}
            onValueChange={(value) => updateFormData({ neighborhoodType: value })}
          >
            <SelectTrigger id="neighborhood-type" className="h-11">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {neighbourhoodTypes.map((type) => (
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

{/* Row 4: Province & Country */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <Label htmlFor="province" className="text-sm font-medium text-gray-700">
      Province <span className="text-red-500">*</span>
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
</div>

{/* Row 5: Postal Code & Direct Number */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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