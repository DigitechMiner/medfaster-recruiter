"use client";

import FileUpload from "../components/FileUpload";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import { provinces, orgTypes } from "@/utils/constant/metadata";

export default function OrganizationDetailsStep() {
  return (
    <>
      <div className="mb-6">
        <FileUpload
          name="photo"
          label="Upload Organization Photo"
          accept="image/*"
          description="Supports images, max 5MB per file."
          required
        />
      </div>

      {/* Row 1: 3 columns - Org Name, Registered Business Name, Org Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <FormInput
          name="orgName"
          label="Organization / Company Name"
          required
        />
        <FormInput
          name="registeredBusinessName"
          label="Registered Business Name"
        />
        <FormSelect
          name="orgType"
          label="Organization Type"
          options={orgTypes}
          required
          placeholder="Select type"
        />
      </div>

      {/* Row 2: 2 columns - Email, Contact Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <FormInput
          name="email"
          label="Official Email Address"
          type="email"
        />
        <FormInput
          name="contactNumber"
          label="Contact Number (landline or mobile)"
        />
      </div>

      {/* Row 3: 3 columns - Website, Business Number, GST No */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-4">
        <FormInput
          name="website"
          label="Organisation Website"
        />
        <FormInput
          name="businessNumber"
          label="Canadian Business Number"
          required
        />
        <FormInput
          name="gstNo"
          label="GST No"
          required
        />
      </div>

      {/* Row 4: 2 columns - Street Address, Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <FormInput
          name="address"
          label="Street Address"
        />
        <FormInput
          name="postalCode"
          label="Postal Code"
          required
        />
      </div>

      {/* Row 5: 3 columns - Province, City, Country */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-4">
        <FormSelect
          name="province"
          label="Province"
          options={provinces}
          required
          placeholder="Select Province"
        />
        <FormInput
          name="city"
          label="City"
          required
        />
        <FormInput
          name="country"
          label="Country"
          required
        />
      </div>
    </>
  );
}
