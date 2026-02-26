"use client";

import FormInput from "../components/FormInput";

export default function ContactInformationStep() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      <FormInput
        name="primaryContact"   // ← was missing
        label="Primary Contact Person"
      />
      <FormInput
        name="contactName"      // ← was "fullName"
        label="Full Name"
      />
      <FormInput
        name="designation"      // ← already correct ✅
        label="Designation"
      />
      <FormInput
        name="contactEmail"     // ← was "emailId"
        label="Email Id"
        type="email"
      />
      <FormInput
        name="phone"            // ← was "phoneNumber"
        label="Phone Number"
      />
    </div>
  );
}
