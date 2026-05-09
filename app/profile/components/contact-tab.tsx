"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";

import { FormInput } from "@/components/forms";
import { Button } from "@/components/ui/button";

import type { ProfileFormValues } from "../utils";

type ProfileContactTabProps = {
  methods: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
};

export function ProfileContactTab({ methods, onSubmit }: ProfileContactTabProps) {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Contact information</h2>
          <p className="text-sm text-gray-500 mt-1">
            Primary contact person from registration (Step 2)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput name="fullName" label="Full Name" placeholder="Enter full name" />
          <FormInput name="designation" label="Designation" placeholder="Enter designation" />
          <FormInput
            name="emailId"
            label="Email Id"
            type="email"
            placeholder="Enter email address"
          />
          <FormInput name="phoneNumber" label="Phone Number" placeholder="Enter phone number" />
        </div>

        <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
          <Button
            type="submit"
            disabled={!methods.formState.isDirty || methods.formState.isSubmitting}
            className={`px-6 py-2 flex items-center gap-2 rounded-md font-medium transition-colors ${
              methods.formState.isDirty
                ? "bg-[#f47b20] text-white hover:bg-[#d5650e]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {methods.formState.isSubmitting ? "Updating..." : "Update profile"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
