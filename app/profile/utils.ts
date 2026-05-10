import { z } from "zod";

import type { OrgDetailsType } from "@/components/forms";
import type { RecruiterProfile } from "@/features/profile";

import { convertProvinceToFrontend } from "@/utils/constant/metadata";

export const profileSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  designation: z.string().min(1, "Designation is required"),
  emailId: z.string().email({ message: "Invalid email" }),
  phoneNumber: z.string().min(1, "Phone Number is required"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function profileToContactForm(profile: RecruiterProfile): ProfileFormValues {
  return {
    fullName: profile.contact_person_name ?? "",
    designation: profile.contact_person_designation ?? "",
    emailId: profile.contact_person_email ?? "",
    phoneNumber: profile.contact_person_phone ?? "",
  };
}

export function buildContactFormData(data: ProfileFormValues): FormData {
  const fd = new FormData();
  fd.append("contact_person_name", data.fullName);
  fd.append("contact_person_designation", data.designation);
  fd.append("contact_person_email", data.emailId);
  fd.append("contact_person_phone", data.phoneNumber);
  return fd;
}

export function profileToOrgForm(profile: RecruiterProfile): OrgDetailsType {
  const mappedProvince = convertProvinceToFrontend(profile.province);
  return {
    organization_photo: null,
    orgName: profile.organization_name ?? "",
    registeredBusinessName: profile.registered_business_name ?? "",
    orgType: profile.organization_type ?? "",
    email: profile.official_email_address ?? "",
    website: profile.organization_website ?? "",
    contactNumber: profile.contact_number ?? "",
    businessNumber: profile.canadian_business_number ?? "",
    gstNo: profile.gst_no ?? "",
    address: profile.street_address ?? "",
    postalCode: profile.postal_code ?? "",
    province: mappedProvince ?? profile.province ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
  };
}

const normalizeValue = (value?: string | null) =>
  (value ?? "").toLowerCase().replace(/[\s_-]/g, "");

export function findMatchingOptionValue(
  currentValue: string,
  options: Array<{ label: string; value: string }>,
) {
  const normalizedCurrent = normalizeValue(currentValue);
  const matched = options.find((option) => {
    const normalizedOptionValue = normalizeValue(option.value);
    const normalizedOptionLabel = normalizeValue(option.label);
    return (
      normalizedOptionValue === normalizedCurrent ||
      normalizedOptionLabel === normalizedCurrent ||
      normalizedOptionLabel.includes(normalizedCurrent) ||
      normalizedCurrent.includes(normalizedOptionLabel) ||
      normalizedOptionValue.includes(normalizedCurrent) ||
      normalizedCurrent.includes(normalizedOptionValue)
    );
  });
  return matched?.value;
}

export function buildOrgFormData(
  data: OrgDetailsType,
  dirtyFields: Partial<Record<keyof OrgDetailsType, boolean>>,
): FormData {
  const fd = new FormData();

  const appendIfDirty = (
    formKey: keyof OrgDetailsType,
    apiKey: string,
    value: string,
  ) => {
    if (dirtyFields[formKey]) {
      fd.append(apiKey, value);
    }
  };

  appendIfDirty("orgName", "organization_name", data.orgName);
  appendIfDirty(
    "registeredBusinessName",
    "registered_business_name",
    data.registeredBusinessName ?? "",
  );
  appendIfDirty("orgType", "organization_type", data.orgType ?? "");
  appendIfDirty("email", "official_email_address", data.email);
  appendIfDirty("contactNumber", "contact_number", data.contactNumber);
  appendIfDirty("website", "organization_website", data.website);
  appendIfDirty(
    "businessNumber",
    "canadian_business_number",
    data.businessNumber,
  );
  appendIfDirty("gstNo", "gst_no", data.gstNo ?? "");
  appendIfDirty("address", "street_address", data.address);
  appendIfDirty("postalCode", "postal_code", data.postalCode);
  appendIfDirty("province", "province", data.province ?? "");
  appendIfDirty("city", "city", data.city);
  appendIfDirty("country", "country", data.country);

  if (
    dirtyFields.organization_photo &&
    data.organization_photo instanceof File
  ) {
    fd.append("organization_photo", data.organization_photo);
  }

  return fd;
}
