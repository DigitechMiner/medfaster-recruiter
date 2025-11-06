"use client";

import FormInput from "../components/FormInput";

export default function ContactInformationStep() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <FormInput
        name="primaryContact"
        label="Primary Contact Person"
        required
      />
      <FormInput
        name="contactName"
        label="Contact Person Name"
        required
      />
      <FormInput
        name="designation"
        label="Contact Person Designation"
        required
      />
      <FormInput
        name="contactEmail"
        label="Contact Person Email"
        type="email"
        required
        wrapperClassName="sm:col-span-2 lg:col-span-2"
      />
      <FormInput
        name="phone"
        label="Contact Person Phone"
        required
      />
    </div>
  );
}
