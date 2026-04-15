"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import { Navbar } from "@/components/global/navbar";
import { FormInput } from "../registration/components";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/stores/authStore";
import { getRecruiterProfile, RecruiterProfile, updateRecruiterProfile } from "@/stores/api/recruiter-api";

const profileSchema = z.object({
  fullName:    z.string().min(1, "Full Name is required"),
  designation: z.string().min(1, "Designation is required"),
  // contact_person_email — from registration Step 2, NOT official_email_address (that's the org)
  emailId:     z.string().email({ message: "Invalid email" }),
  phoneNumber: z.string().min(1, "Phone Number is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function profileToContactForm(profile: RecruiterProfile): ProfileFormValues {
  return {
    fullName:    profile.contact_person_name        ?? "",
    designation: profile.contact_person_designation ?? "",
    emailId:     profile.contact_person_email       ?? "",
    phoneNumber: profile.contact_person_phone       ?? "",
  };
}

function buildContactFormData(data: ProfileFormValues): FormData {
  const fd = new FormData();
  fd.append("contact_person_name",        data.fullName);
  fd.append("contact_person_designation", data.designation);
  fd.append("contact_person_email",       data.emailId);
  fd.append("contact_person_phone",       data.phoneNumber);
  return fd;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const { loadRecruiterProfile }  = useAuthStore();

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", designation: "", emailId: "", phoneNumber: "" },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getRecruiterProfile();
        if (profile) methods.reset(profileToContactForm(profile));
      } catch {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const res = await updateRecruiterProfile(buildContactFormData(data));
      if (res.success) {
        toast.success("Profile updated successfully!");
        methods.reset(data);
        await loadRecruiterProfile();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred while updating profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-gray-500 text-sm animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Navbar />
      <div className="p-6 font-sans">
        <div className="max-w-5xl mx-auto">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Your contact information from registration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput name="fullName"    label="Full Name"    placeholder="Enter full name" />
                <FormInput name="designation" label="Designation"  placeholder="Enter designation" />
                <FormInput name="emailId"     label="Email Id"     type="email" placeholder="Enter email address" />
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
                  {methods.formState.isSubmitting ? "Updating..." : "Update & continue"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}