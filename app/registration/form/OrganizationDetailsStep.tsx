"use client";

import FileUpload from "../components/FileUpload";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import { provinces, orgTypes } from "../const";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FormInput
          name="orgName"
          label="Organization Name"
          required
        />
        <FormSelect
          name="orgType"
          label="Organization Type"
          options={orgTypes}
          required
          placeholder="Select type"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <FormInput
          name="email"
          label="Official Email Address"
          type="email"
          required
        />
        <FormInput
          name="contactNumber"
          label="Contact Number (landline or mobile)"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <FormInput
          name="website"
          label="Organisation Website"
          required
        />
        <FormInput
          name="businessNumber"
          label="Canadian Business Number"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <FormInput
          name="address"
          label="Street Address"
          required
        />
        <FormInput
          name="postalCode"
          label="Postal Code"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <FormSelect
          name="province"
          label="Province"
          options={provinces}
          required
          placeholder="Select Province"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
      </div>
    </>
  );
}
