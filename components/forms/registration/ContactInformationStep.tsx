"use client";

import { FormInput } from "@/components/forms";

export default function ContactInformationStep() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      <FormInput name="contactName" label="Full Name" placeholder="Full Name" />
      <FormInput name="designation" label="Designation" placeholder="Designation" />
      <FormInput name="contactEmail" label="Email Id" type="email" placeholder="Email Id" />
      <FormInput name="primaryContact" label="Phone Number" placeholder="Phone Number" />
    </div>
  );
}
