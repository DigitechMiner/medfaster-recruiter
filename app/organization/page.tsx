"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "react-toastify";
import { FileText, Plus, Pencil } from "lucide-react";

import { FormInput, FormPageLayout, FormSelect } from "@/components/forms";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/stores/authStore";
import { useMetadataStore } from "@/stores/metadataStore";
import {
  complianceFields,
  orgSchema,
  type OrgDetailsType,
} from "@/components/forms";
import { getBackendImageUrl } from "@/stores/api/api-client";
import {
  viewRecruiterDocument,
  type RecruiterDocument,
  type RecruiterProfile,
} from "@/stores/api/recruiter-api";

import { convertProvinceToFrontend } from "@/utils/constant/metadata";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileToOrgForm(profile: RecruiterProfile): OrgDetailsType {
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

const findMatchingOptionValue = (
  currentValue: string,
  options: Array<{ label: string; value: string }>,
) => {
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
};

function buildOrgFormData(
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

// ─────────────────────────────────────────────────────────────────────────────

export default function OrganizationPage() {
  const [orgPhotoUrl, setOrgPhotoUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<RecruiterDocument[]>([]); // ✅ typed
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [docType, setDocType] = useState<string>(complianceFields[0].name);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // ✅ Use store actions — not raw API calls
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const recruiterDocuments = useAuthStore((state) => state.recruiterDocuments);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const organizationTypeOptions = useMetadataStore(
    (state) => state.organizationTypeOptions,
  );
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const metadataLoaded = useMetadataStore((state) => state.loaded);
  const isPageLoading = !metadataLoaded || !recruiterProfile;
  const fieldClassName = "h-10 text-sm";

  const methods = useForm<OrgDetailsType>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      organization_photo: null,
      orgName: "",
      registeredBusinessName: "",
      orgType: "",
      email: "",
      website: "",
      contactNumber: "",
      businessNumber: "",
      gstNo: "",
      address: "",
      postalCode: "",
      province: "",
      city: "",
      country: "",
    },
  });

  useEffect(() => {
    if (!recruiterProfile) return;
    methods.reset(profileToOrgForm(recruiterProfile));
    if (recruiterProfile.organization_photo_url) {
      setOrgPhotoUrl(
        getBackendImageUrl(recruiterProfile.organization_photo_url),
      );
    }
  }, [recruiterProfile, methods]);

  const organizationTypeSelectOptions = useMemo(
    () =>
      organizationTypeOptions.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    [organizationTypeOptions],
  );

  const provinceSelectOptions = useMemo(
    () =>
      provinceOptions.map((item) => ({ label: item.label, value: item.value })),
    [provinceOptions],
  );

  useEffect(() => {
    if (!metadataLoaded || !recruiterProfile) return;

    const profileOrgType =
      recruiterProfile.organization_type ?? methods.getValues("orgType");
    if (profileOrgType && organizationTypeSelectOptions.length > 0) {
      const matchedOrgTypeValue = findMatchingOptionValue(
        profileOrgType,
        organizationTypeSelectOptions,
      );
      if (matchedOrgTypeValue) {
        methods.setValue("orgType", matchedOrgTypeValue, {
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }

    const profileProvinceRaw =
      recruiterProfile.province ?? methods.getValues("province");
    if (profileProvinceRaw && provinceSelectOptions.length > 0) {
      const matchedProvinceValue =
        findMatchingOptionValue(profileProvinceRaw, provinceSelectOptions) ??
        findMatchingOptionValue(
          convertProvinceToFrontend(profileProvinceRaw) ?? "",
          provinceSelectOptions,
        );
      if (matchedProvinceValue) {
        methods.setValue("province", matchedProvinceValue, {
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
  }, [
    metadataLoaded,
    recruiterProfile,
    organizationTypeSelectOptions,
    provinceSelectOptions,
    methods,
  ]);

  useEffect(() => {
    setDocuments(recruiterDocuments ?? []);
  }, [recruiterDocuments]);

  if (isPageLoading) {
    return (
      <FormPageLayout innerClassName="space-y-6 animate-pulse">
        <div className="mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="h-7 w-64 bg-gray-200 rounded mb-8" />
            <div className="flex flex-col items-center mb-10">
              <div className="h-5 w-36 bg-gray-200 rounded mb-3" />
              <div className="border border-dashed border-gray-300 rounded-lg p-6 w-full max-w-sm">
                <div className="h-20 w-full bg-gray-200 rounded mb-4" />
                <div className="h-4 w-40 mx-auto bg-gray-200 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {Array.from({ length: 13 }).map((_, index) => (
                <div
                  key={index}
                  className={index === 12 ? "md:col-start-2" : ""}
                >
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-10 w-full bg-gray-100 rounded-md border border-gray-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="h-7 w-72 bg-gray-200 rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
                  <div className="h-14 w-full bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormPageLayout>
    );
  }

  // ── Submit org text fields ─────────────────────────────────────────────────
  const onSubmit = async (data: OrgDetailsType) => {
    try {
      const dirtyFields = methods.formState.dirtyFields as Partial<
        Record<keyof OrgDetailsType, boolean>
      >;
      const payload = buildOrgFormData(data, dirtyFields);
      const res = await updateProfile(payload); // ✅ send only changed fields
      if (res.ok) {
        toast.success("Organization details updated successfully!");
        methods.reset(data);
        const { recruiterDocuments } = useAuthStore.getState();
        if (recruiterDocuments) setDocuments(recruiterDocuments);
      } else {
        toast.error(res.message || "Failed to update organization");
      }
    } catch {
      toast.error("An error occurred while updating organization");
    }
  };

  const handleViewDocument = async (doc: RecruiterDocument) => {
    try {
      const res = await viewRecruiterDocument(doc.id);
      const viewUrl =
        res.data?.file_url ??
        res.data?.view_url ??
        res.data?.url ??
        res.data?.signed_url ??
        doc.file_url;
      if (!viewUrl) {
        toast.error("Document URL is not available");
        return;
      }
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to view document",
      );
    }
  };

  // ── Logo upload ────────────────────────────────────────────────────────────
  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOrgPhotoUrl(URL.createObjectURL(file));
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("organization_photo", file);
      const res = await updateProfile(fd); // ✅ store action
      if (res.ok) {
        toast.success("Logo updated successfully!");
        const { recruiterProfile } = useAuthStore.getState();
        if (recruiterProfile?.organization_photo_url) {
          setOrgPhotoUrl(
            getBackendImageUrl(recruiterProfile.organization_photo_url),
          );
        }
      } else {
        toast.error(res.message || "Failed to upload logo");
      }
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // ── Document upload ────────────────────────────────────────────────────────
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading document...");
    try {
      const fd = new FormData();
      fd.append(docType, file); // ✅ field name = doc type key e.g. "operating_license"

      const res = await updateProfile(fd); // ✅ store action — auto-refreshes docs in store

      if (res.ok) {
        toast.update(toastId, {
          render: "Document uploaded successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        // ✅ store already updated recruiterDocuments from the PATCH response
        const { recruiterDocuments } = useAuthStore.getState();
        if (recruiterDocuments) setDocuments(recruiterDocuments);
        setIsAddingDoc(false);
      } else {
        toast.update(toastId, {
          render: res.message || "Failed to upload document",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch {
      toast.update(toastId, {
        render: "Upload failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
    e.target.value = "";
  };

  return (
    <FormPageLayout innerClassName="space-y-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* ── Organization Overview ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-8">
              Organization Overview
            </h2>

            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
              <label className="text-sm font-medium text-gray-700 mb-3">
                Organization Logo
              </label>
              <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center w-full max-w-sm">
                <div className="relative w-48 h-20 mb-4 flex items-center justify-center">
                  {orgPhotoUrl ? (
                    <Image
                      src={orgPhotoUrl}
                      alt="Organization Logo"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="bg-gray-100 rounded w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No logo uploaded
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="flex items-center gap-1 text-sm text-[#f47b20] hover:underline disabled:opacity-50"
                >
                  <Pencil className="w-3 h-3" />
                  {isUploadingLogo
                    ? "Uploading..."
                    : "Update Organization Logo"}
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <FormInput
                name="orgName"
                label="Organization / Company Name"
                required
                className={fieldClassName}
              />
              <FormInput
                name="registeredBusinessName"
                label="Registered Business Name"
                className={fieldClassName}
              />
              <FormSelect
                name="orgType"
                label="Organization Type"
                options={organizationTypeSelectOptions}
                required
                className={fieldClassName}
              />
              <FormInput
                name="email"
                label="Official Email Address"
                type="email"
                className={fieldClassName}
              />
              <FormInput
                name="website"
                label="Organisation Website"
                className={fieldClassName}
              />
              <FormInput
                name="contactNumber"
                label="Contact Number (landline or mobile)"
                required
                className={fieldClassName}
              />
              <FormInput
                name="businessNumber"
                label="Canadian Business Number"
                required
                className={fieldClassName}
              />
              <FormInput
                name="gstNo"
                label="GST No"
                className={fieldClassName}
              />
              <FormInput
                name="address"
                label="Street Address"
                required
                className={fieldClassName}
              />
              <FormInput
                name="postalCode"
                label="Postal Code"
                required
                className={fieldClassName}
              />
              <FormSelect
                name="province"
                label="Province"
                options={provinceSelectOptions}
                required
                className={fieldClassName}
              />
              <FormInput
                name="city"
                label="City"
                required
                className={fieldClassName}
              />
              <div className="md:col-start-2">
                <FormInput
                  name="country"
                  label="Country"
                  required
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
              <Button
                type="submit"
                disabled={
                  !methods.formState.isDirty || methods.formState.isSubmitting
                }
                className={`px-6 py-2 flex items-center gap-2 rounded-md font-medium transition-colors ${
                  methods.formState.isDirty
                    ? "bg-[#f47b20] text-white hover:bg-[#d5650e]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {methods.formState.isSubmitting
                  ? "Updating..."
                  : "Update & Continue"}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* ── Compliance Card ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Organization Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id}>
                    <label className="text-sm font-medium text-gray-700 block mb-2 capitalize">
                      {doc.document_type.replace(/_/g, " ")}{" "}
                      <span className="text-[#f47b20]">*</span>
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                      <div className="bg-red-50 text-red-500 p-2 rounded flex-shrink-0">
                        <FileText className="w-6 h-6" />
                        <span className="text-[10px] font-bold block text-center mt-1">
                          DOC
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* ✅ Real filename — strip S3 query params */}
                        <p className="text-sm font-medium text-gray-900 truncate capitalize">
                          {doc.document_type.replace(/_/g, " ")}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          {/* ✅ status — correct field name */}
                          <span
                            className={`font-medium ${doc.status === "verified" ? "text-green-600" : "text-amber-500"}`}
                          >
                            {doc.status}
                          </span>
                          {/* ✅ file_url — already a full presigned S3 URL */}
                          <button
                            type="button"
                            onClick={() => void handleViewDocument(doc)}
                            className="text-green-600 flex items-center gap-1 hover:underline"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Document
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic col-span-2">
                  No compliance documents found.
                </p>
              )}
            </div>

            {/* Add document row */}
            {isAddingDoc && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* ✅ Options derived from complianceFields in const.ts */}
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#f47b20]"
                >
                  {complianceFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f47b20] text-white rounded-md text-sm font-medium hover:bg-[#d5650e] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Choose File
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleDocumentUpload}
            />

            <button
              type="button"
              onClick={() => setIsAddingDoc(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add More Documents
            </button>
          </div>
        </form>
      </FormProvider>
    </FormPageLayout>
  );
}
