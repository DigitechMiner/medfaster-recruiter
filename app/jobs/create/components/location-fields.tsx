// app/jobs/create/components/location-fields.tsx
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

interface LocationFieldsProps {
  formData: {
    streetAddress?: string;
    postalCode?: string;
    province?: string;
    city?: string;
    country?: string;
  };
  updateFormData: (updates: any) => void;
}

export function LocationFields({ formData, updateFormData }: LocationFieldsProps) {
  return (
    <div className="space-y-6 mb-6">
      {/* Street Address & Postal Code */}
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

      {/* Province, City, Country */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="province" className="text-sm font-medium text-gray-700">
            Province
          </Label>
          <Select
            value={formData.province || "Ontario (ON)"}
            onValueChange={(value) => updateFormData({ province: value })}
          >
            <SelectTrigger id="province" className="h-11 border-[#F4781B]">
              <SelectValue placeholder="Ontario (ON)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ontario (ON)">Ontario (ON)</SelectItem>
              <SelectItem value="British Columbia (BC)">British Columbia (BC)</SelectItem>
              <SelectItem value="Alberta (AB)">Alberta (AB)</SelectItem>
            </SelectContent>
          </Select>
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
            placeholder="Ontario"
            className="h-11"
            required
          />
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
    </div>
  );
}
