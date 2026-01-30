"use client";

import FormInput from "../components/FormInput";

export default function ContactInformationStep() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      <FormInput
        name="fullName"
        label="Full Name"
      />
      <FormInput
        name="designation"
        label="Designation"
      />
      <FormInput
        name="emailId"
        label="Email Id"
        type="email"
      />
      <FormInput
        name="phoneNumber"
        label="Phone Number"
      />
    </div>
  );
}
