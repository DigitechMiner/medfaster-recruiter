"use client";

import Image from "next/image";
import type { ChangeEvent, RefObject } from "react";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider, useFormContext, useWatch } from "react-hook-form";
import { Pencil } from "lucide-react";

import { FormInput, FormSelect } from "@/components/forms";
import type { OrgDetailsType } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { useCanadianCitySelectOptions } from "@/hooks/useCanadianCityOptions";
import { useMetadataStore } from "@/stores/metadataStore";
import { getCitiesForProvince, type CanadianProvinceOption } from "@/utils/constant/metadata";

type ProfileOrganizationTabProps = {
  methods: UseFormReturn<OrgDetailsType>;
  onSubmit: (data: OrgDetailsType) => Promise<void>;
  organizationTypeSelectOptions: Array<{ label: string; value: string }>;
  provinceSelectOptions: Array<{ label: string; value: string }>;
  orgPhotoUrl: string | null;
  logoInputRef: RefObject<HTMLInputElement | null>;
  isUploadingLogo: boolean;
  onLogoFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fieldClassName: string;
};

function OrganizationLocationFields({
  provinceSelectOptions,
  fieldClassName,
}: {
  provinceSelectOptions: Array<{ label: string; value: string }>;
  fieldClassName: string;
}) {
  const { setValue, getValues } = useFormContext<OrgDetailsType>();
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const selectedProvince = useWatch({ name: "province" });
  const citySelectOptions = useCanadianCitySelectOptions(selectedProvince);

  useEffect(() => {
    const currentCity = getValues("city");
    if (!selectedProvince) {
      if (currentCity) {
        setValue("city", "", { shouldValidate: true });
      }
      return;
    }

    const cities = getCitiesForProvince(
      provinceOptions as CanadianProvinceOption[],
      selectedProvince,
    );
    if (currentCity && !cities.some((city) => city.value === currentCity)) {
      setValue("city", "", { shouldValidate: true });
    }
  }, [selectedProvince, provinceOptions, setValue, getValues]);

  return (
    <>
      <FormSelect
        name="province"
        label="Province"
        options={provinceSelectOptions}
        required
        className={fieldClassName}
        placeholder="Select Province"
      />
      <FormSelect
        name="city"
        label="City"
        options={citySelectOptions}
        required
        className={fieldClassName}
        placeholder={selectedProvince ? "Select City" : "Select province first"}
        disabled={!selectedProvince}
        emptyMessage="No cities available for this province"
      />
      <div className="md:col-start-2">
        <FormInput name="country" label="Country" required className={fieldClassName} />
      </div>
    </>
  );
}

export function ProfileOrganizationTab({
  methods,
  onSubmit,
  organizationTypeSelectOptions,
  provinceSelectOptions,
  orgPhotoUrl,
  logoInputRef,
  isUploadingLogo,
  onLogoFileChange,
  fieldClassName,
}: ProfileOrganizationTabProps) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Organization Overview</h2>

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
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoFileChange}
              />
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
            <FormInput name="email" label="Official Email Address" type="email" className={fieldClassName} />
            <FormInput name="website" label="Organisation Website" className={fieldClassName} />
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
            <FormInput name="gstNo" label="GST No" className={fieldClassName} />
            <FormInput name="address" label="Street Address" required className={fieldClassName} />
            <FormInput name="postalCode" label="Postal Code" required className={fieldClassName} />
            <OrganizationLocationFields
              provinceSelectOptions={provinceSelectOptions}
              fieldClassName={fieldClassName}
            />
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
              {methods.formState.isSubmitting ? "Updating..." : "Update organization"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
