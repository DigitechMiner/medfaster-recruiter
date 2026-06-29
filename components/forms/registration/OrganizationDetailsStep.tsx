"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { FileUpload, FormInput, FormSelect } from "@/components/forms";
import { useCanadianCitySelectOptions } from "@/hooks/useCanadianCityOptions";
import { useMetadataStore } from "@/stores/metadataStore";
import { getCitiesForProvince, type CanadianProvinceOption } from "@/utils/constant/metadata";

const DEFAULT_ROW_CLASS = "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4";
const FIRST_ROW_CLASS = "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5";

type BaseField = {
  name: string;
  label: string;
  required?: boolean;
};

type InputField = BaseField & {
  type: "input";
  typeInput?: string;
};

type SelectField = BaseField & {
  type: "select";
  placeholder?: string;
  options: { label: string; value: string }[];
};

type StandardField = InputField | SelectField;

const standardRows: StandardField[][] = [
  [
    { type: "input", name: "orgName", label: "Organization / Company Name", required: true },
    { type: "input", name: "registeredBusinessName", label: "Registered Business Name", required: true },
  ],
  [
    {
      type: "select",
      name: "orgType",
      label: "Organization Type",
      required: true,
      placeholder: "Select type",
      options: [],
    },
    { type: "input", name: "email", label: "Official Email Address", typeInput: "email" },
  ],
  [
    { type: "input", name: "website", label: "Organisation Website" },
    { type: "input", name: "contactNumber", label: "Contact Number (landline or mobile)" },
  ],
  [
    { type: "input", name: "businessNumber", label: "Canadian Business Number", required: true },
    { type: "input", name: "gstNo", label: "GST No", required: true },
  ],
  [
    { type: "input", name: "address", label: "Street Address" },
    { type: "input", name: "postalCode", label: "Postal Code", required: true },
  ],
] as const;

export default function OrganizationDetailsStep() {
  const { setValue, getValues } = useFormContext();
  const organizationTypeOptions = useMetadataStore((state) => state.organizationTypeOptions);
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const selectedProvince = useWatch({ name: "province" });
  const citySelectOptions = useCanadianCitySelectOptions(selectedProvince);

  const orgTypeSelectOptions = organizationTypeOptions.map((item) => ({
    label: item.label,
    value: item.value,
  }));
  const provinceSelectOptions = provinceOptions.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  useEffect(() => {
    if (!getValues("country")) {
      setValue("country", "Canada", { shouldDirty: false, shouldValidate: false });
    }
  }, [getValues, setValue]);

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
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-xl">
          <FileUpload
            name="organization_photo"
            label="Upload Organization Logo"
            fileType="photo"
            accept="image/*"
            description="Supports images, max 5MB per file."
          />
        </div>
      </div>

      {standardRows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className={rowIndex === 0 ? FIRST_ROW_CLASS : DEFAULT_ROW_CLASS}>
          {row.map((field) =>
            field.type === "select" ? (
              <FormSelect
                key={field.name}
                name={field.name}
                label={field.label}
                options={field.name === "orgType" ? orgTypeSelectOptions : field.options}
                required={field.required}
                placeholder={field.placeholder}
              />
            ) : (
              <FormInput
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={field.label}
                required={field.required}
                type={field.typeInput}
              />
            )
          )}
        </div>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 mt-4">
        <FormSelect
          name="province"
          label="Province"
          options={provinceSelectOptions}
          required
          placeholder="Select Province"
          wrapperClassName="sm:col-span-4"
        />
        <FormSelect
          name="city"
          label="City"
          options={citySelectOptions}
          required
          placeholder={
            selectedProvince ? "Select City" : "Select province first"
          }
          disabled={!selectedProvince}
          emptyMessage="No cities available for this province"
          wrapperClassName="sm:col-span-5"
        />
        <FormInput
          name="country"
          label="Country"
          required
          value="Canada"
          wrapperClassName="sm:col-span-3"
          readOnly
        />
      </div>
    </>
  );
}
