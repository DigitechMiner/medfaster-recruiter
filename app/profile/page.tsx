"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Building2, FileText, Shield, User } from "lucide-react";

import { complianceFields, FormPageLayout } from "@/components/forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ProfileContactTab } from "./components/contact-tab";
import { ProfileDocumentsTab } from "./components/documents-tab";
import { ProfileOrganizationTab } from "./components/organization-tab";
import { ProfileSecurityTab } from "./components/security-tab";
import {
  buildContactFormData,
  buildOrgFormData,
  findMatchingOptionValue,
  profileSchema,
  profileToContactForm,
  profileToOrgForm,
  type ProfileFormValues,
} from "./utils";

import { useAuthStore } from "@/stores/authStore";
import { useMetadataStore } from "@/stores/metadataStore";
import { orgSchema, type OrgDetailsType } from "@/components/forms";
import { getBackendImageUrl } from "@/stores/api/api-client";
import {
  viewRecruiterDocument,
  type RecruiterDocument,
} from "@/stores/api/recruiter-api";

import { convertProvinceToFrontend } from "@/utils/constant/metadata";

const tabTriggerClass =
  "gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md border border-transparent transition-colors data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-[#f47b20] data-[state=active]:shadow-sm hover:text-gray-900";

export default function ProfilePage() {
  const [orgPhotoUrl, setOrgPhotoUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<RecruiterDocument[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [docType, setDocType] = useState<string>(complianceFields[0].name);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const recruiterDocuments = useAuthStore((state) => state.recruiterDocuments);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const organizationTypeOptions = useMetadataStore((state) => state.organizationTypeOptions);
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const metadataLoaded = useMetadataStore((state) => state.loaded);
  const isPageLoading = !metadataLoaded || !recruiterProfile;
  const fieldClassName = "h-10 text-sm";

  const contactMethods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      designation: "",
      emailId: "",
      phoneNumber: "",
    },
  });

  const orgMethods = useForm<OrgDetailsType>({
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
    contactMethods.reset(profileToContactForm(recruiterProfile));
  }, [recruiterProfile, contactMethods]);

  useEffect(() => {
    if (!recruiterProfile) return;
    orgMethods.reset(profileToOrgForm(recruiterProfile));
    if (recruiterProfile.organization_photo_url) {
      setOrgPhotoUrl(getBackendImageUrl(recruiterProfile.organization_photo_url));
    }
  }, [recruiterProfile, orgMethods]);

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
      recruiterProfile.organization_type ?? orgMethods.getValues("orgType");
    if (profileOrgType && organizationTypeSelectOptions.length > 0) {
      const matchedOrgTypeValue = findMatchingOptionValue(
        profileOrgType,
        organizationTypeSelectOptions,
      );
      if (matchedOrgTypeValue) {
        orgMethods.setValue("orgType", matchedOrgTypeValue, {
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }

    const profileProvinceRaw =
      recruiterProfile.province ?? orgMethods.getValues("province");
    if (profileProvinceRaw && provinceSelectOptions.length > 0) {
      const matchedProvinceValue =
        findMatchingOptionValue(profileProvinceRaw, provinceSelectOptions) ??
        findMatchingOptionValue(
          convertProvinceToFrontend(profileProvinceRaw) ?? "",
          provinceSelectOptions,
        );
      if (matchedProvinceValue) {
        orgMethods.setValue("province", matchedProvinceValue, {
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
    orgMethods,
  ]);

  useEffect(() => {
    setDocuments(recruiterDocuments ?? []);
  }, [recruiterDocuments]);

  const onContactSubmit = async (data: ProfileFormValues) => {
    try {
      const res = await updateProfile(buildContactFormData(data));
      if (res.ok) {
        toast.success("Profile updated successfully!");
        contactMethods.reset(data);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred while updating profile");
    }
  };

  const onOrgSubmit = async (data: OrgDetailsType) => {
    try {
      const dirtyFields = orgMethods.formState.dirtyFields as Partial<
        Record<keyof OrgDetailsType, boolean>
      >;
      const payload = buildOrgFormData(data, dirtyFields);
      const res = await updateProfile(payload);
      if (res.ok) {
        toast.success("Organization details updated successfully!");
        orgMethods.reset(data);
        const { recruiterDocuments: docs } = useAuthStore.getState();
        if (docs) setDocuments(docs);
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
      toast.error(error instanceof Error ? error.message : "Failed to view document");
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOrgPhotoUrl(URL.createObjectURL(file));
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("organization_photo", file);
      const res = await updateProfile(fd);
      if (res.ok) {
        toast.success("Logo updated successfully!");
        const { recruiterProfile: next } = useAuthStore.getState();
        if (next?.organization_photo_url) {
          setOrgPhotoUrl(getBackendImageUrl(next.organization_photo_url));
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

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading document...");
    try {
      const fd = new FormData();
      fd.append(docType, file);

      const res = await updateProfile(fd);

      if (res.ok) {
        toast.update(toastId, {
          render: "Document uploaded successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        const { recruiterDocuments: docs } = useAuthStore.getState();
        if (docs) setDocuments(docs);
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

  if (isPageLoading) {
    return (
      <FormPageLayout innerClassName="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-full max-w-md bg-gray-100 rounded" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="h-7 w-56 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-10 w-full bg-gray-100 rounded-md border border-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout innerClassName="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Contact details, organization, compliance documents, and sign-in verification
        </p>
      </div>

      <Tabs defaultValue="contact" className="flex w-full flex-col gap-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList
            className={cn(
              "inline-flex h-auto min-h-10 w-max min-w-full flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:flex-nowrap sm:justify-start",
            )}
          >
            <TabsTrigger value="contact" className={cn("inline-flex items-center", tabTriggerClass)}>
              <User className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Contact
            </TabsTrigger>
            <TabsTrigger value="organization" className={cn("inline-flex items-center", tabTriggerClass)}>
              <Building2 className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Organization
            </TabsTrigger>
            <TabsTrigger value="documents" className={cn("inline-flex items-center", tabTriggerClass)}>
              <FileText className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Documents
            </TabsTrigger>
            <TabsTrigger value="security" className={cn("inline-flex items-center", tabTriggerClass)}>
              <Shield className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Sign-in & security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contact" className="mt-0 outline-none">
          <ProfileContactTab methods={contactMethods} onSubmit={onContactSubmit} />
        </TabsContent>

        <TabsContent value="organization" className="mt-0 outline-none">
          <ProfileOrganizationTab
            methods={orgMethods}
            onSubmit={onOrgSubmit}
            organizationTypeSelectOptions={organizationTypeSelectOptions}
            provinceSelectOptions={provinceSelectOptions}
            orgPhotoUrl={orgPhotoUrl}
            logoInputRef={logoInputRef}
            isUploadingLogo={isUploadingLogo}
            onLogoFileChange={handleLogoFileChange}
            fieldClassName={fieldClassName}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-0 outline-none">
          <ProfileDocumentsTab
            documents={documents}
            docType={docType}
            onDocTypeChange={setDocType}
            isAddingDoc={isAddingDoc}
            onSetAddingDoc={setIsAddingDoc}
            docInputRef={docInputRef}
            onDocumentUpload={handleDocumentUpload}
            onViewDocument={handleViewDocument}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-0 outline-none">
          <ProfileSecurityTab />
        </TabsContent>
      </Tabs>
    </FormPageLayout>
  );
}
