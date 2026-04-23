"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "react-toastify";
import { FileText, Plus, Pencil } from "lucide-react";

import { FormInput, FormSelect } from "../registration/components";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/stores/authStore";
import { complianceFields, orgSchema, type OrgDetailsType } from "../registration/const";
import { getBackendImageUrl } from "@/stores/api/api-client";
import type { RecruiterDocument, RecruiterProfile } from "@/stores/api/recruiter-api";

import {
  orgTypes,
  provinces,
  convertOrganizationTypeToFrontend,
  convertOrganizationTypeToBackend,
  convertProvinceToFrontend,
  convertProvinceToBackend,
} from "@/utils/constant/metadata";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileToOrgForm(profile: RecruiterProfile): OrgDetailsType {
  return {
    organization_photo:     null,
    orgName:                profile.organization_name        ?? "",
    registeredBusinessName: profile.registered_business_name ?? "",
    orgType:                convertOrganizationTypeToFrontend(profile.organization_type),
    email:                  profile.official_email_address   ?? "",
    website:                profile.organization_website     ?? "",
    contactNumber:          profile.contact_number           ?? "",
    businessNumber:         profile.canadian_business_number ?? "",
    gstNo:                  profile.gst_no                   ?? "",
    address:                profile.street_address           ?? "",
    postalCode:             profile.postal_code              ?? "",
    province:               convertProvinceToFrontend(profile.province) ?? "",
    city:                   profile.city                     ?? "",
    country:                profile.country                  ?? "",
  };
}

function buildOrgFormData(data: OrgDetailsType): FormData {
  const fd = new FormData();
  fd.append("organization_name",        data.orgName);
  fd.append("registered_business_name", data.registeredBusinessName ?? "");
  fd.append("organization_type",        convertOrganizationTypeToBackend(data.orgType));
  fd.append("official_email_address",   data.email);
  fd.append("contact_number",           data.contactNumber);
  fd.append("organization_website",     data.website);
  fd.append("canadian_business_number", data.businessNumber);
  fd.append("gst_no",                   data.gstNo ?? "");
  fd.append("street_address",           data.address);
  fd.append("postal_code",              data.postalCode);
  fd.append("province",                 convertProvinceToBackend(data.province) ?? "");
  fd.append("city",                     data.city);
  fd.append("country",                  data.country);
  if (data.organization_photo instanceof File) {
    fd.append("organization_photo", data.organization_photo);
  }
  return fd;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OrganizationPage() {
  const [isLoading, setIsLoading]             = useState(true);
  const [orgPhotoUrl, setOrgPhotoUrl]         = useState<string | null>(null);
  const [documents, setDocuments]             = useState<RecruiterDocument[]>([]); // ✅ typed
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isAddingDoc, setIsAddingDoc]         = useState(false);
  const [docType, setDocType]                 = useState(complianceFields[0].name);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef  = useRef<HTMLInputElement>(null);

  // ✅ Use store actions — not raw API calls
  const { loadRecruiterProfile, updateProfile } = useAuthStore();

  const methods = useForm<OrgDetailsType>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      organization_photo: null,
      orgName: "", registeredBusinessName: "", orgType: "", email: "",
      website: "", contactNumber: "", businessNumber: "", gstNo: "",
      address: "", postalCode: "", province: "", city: "", country: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        await loadRecruiterProfile();
        const { recruiterProfile, recruiterDocuments } = useAuthStore.getState();

        if (recruiterProfile) {
          methods.reset(profileToOrgForm(recruiterProfile));
          if (recruiterProfile.organization_photo_url) {
            setOrgPhotoUrl(getBackendImageUrl(recruiterProfile.organization_photo_url));
          }
        }
        if (recruiterDocuments) setDocuments(recruiterDocuments);
      } catch {
        toast.error("Failed to load organization data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit org text fields ─────────────────────────────────────────────────
  const onSubmit = async (data: OrgDetailsType) => {
    try {
      const res = await updateProfile(buildOrgFormData(data)); // ✅ store action
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

  // ── Logo upload ────────────────────────────────────────────────────────────
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setOrgPhotoUrl(getBackendImageUrl(recruiterProfile.organization_photo_url));
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
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5]">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-gray-500 text-sm animate-pulse">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="p-6 font-sans">
        <div className="max-w-5xl mx-auto space-y-6">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>

              {/* ── Organization Overview ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Organization Overview</h2>

                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                  <label className="text-sm font-medium text-gray-700 mb-3">Organization Logo</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center w-full max-w-sm">
                    <div className="relative w-48 h-20 mb-4 flex items-center justify-center">
                      {orgPhotoUrl ? (
                        <Image src={orgPhotoUrl} alt="Organization Logo" fill className="object-contain" />
                      ) : (
                        <div className="bg-gray-100 rounded w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No logo uploaded
                        </div>
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="flex items-center gap-1 text-sm text-[#f47b20] hover:underline disabled:opacity-50"
                    >
                      <Pencil className="w-3 h-3" />
                      {isUploadingLogo ? "Uploading..." : "Update Organization Logo"}
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <FormInput  name="orgName"                label="Organization / Company Name"         required />
                  <FormInput  name="registeredBusinessName" label="Registered Business Name" />
                  <FormSelect name="orgType"                label="Organization Type"                   options={orgTypes}    required />
                  <FormInput  name="email"                  label="Official Email Address"              type="email" />
                  <FormInput  name="website"                label="Organisation Website" />
                  <FormInput  name="contactNumber"          label="Contact Number (landline or mobile)" required />
                  <FormInput  name="businessNumber"         label="Canadian Business Number"            required />
                  <FormInput  name="gstNo"                  label="GST No" />
                  <FormInput  name="address"                label="Street Address"                      required />
                  <FormInput  name="postalCode"             label="Postal Code"                         required />
                  <FormSelect name="province"               label="Province"                            options={provinces}   required />
                  <FormInput  name="city"                   label="City"                                required />
                  <div className="md:col-start-2">
                    <FormInput name="country" label="Country" required />
                  </div>
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
                    {methods.formState.isSubmitting ? "Updating..." : "Update & Continue"}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* ── Compliance Card ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Compliance</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {documents.length > 0 ? documents.map((doc) => (
                    <div key={doc.id}>
                      <label className="text-sm font-medium text-gray-700 block mb-2 capitalize">
                        {doc.document_type.replace(/_/g, " ")} <span className="text-[#f47b20]">*</span>
                      </label>
                      <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                        <div className="bg-red-50 text-red-500 p-2 rounded flex-shrink-0">
                          <FileText className="w-6 h-6" />
                          <span className="text-[10px] font-bold block text-center mt-1">DOC</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          {/* ✅ Real filename — strip S3 query params */}
                          <p className="text-sm font-medium text-gray-900 truncate capitalize">
  {doc.document_type.replace(/_/g, " ")}
</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            {/* ✅ status — correct field name */}
                            <span className={`font-medium ${doc.status === "verified" ? "text-green-600" : "text-amber-500"}`}>
                              {doc.status}
                            </span>
                            {/* ✅ file_url — already a full presigned S3 URL */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!doc.file_url) {
                                  toast.error("Document URL is not available");
                                  return;
                                }
                                window.open(doc.file_url, "_blank", "noopener,noreferrer");
                              }}
                              className="text-green-600 flex items-center gap-1 hover:underline"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Document
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic col-span-2">No compliance documents found.</p>
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
                        <option key={f.name} value={f.name}>{f.label}</option>
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
        </div>
      </div>
    </div>
  );
}