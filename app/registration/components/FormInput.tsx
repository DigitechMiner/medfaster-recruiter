"use client";

import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormInputProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  wrapperClassName?: string;
}

export default function FormInput({
  name,
  label,
  required = false,
  placeholder,
  type = "text",
  className = "",
  wrapperClassName = "",
}: FormInputProps) {
  const methods = useFormContext();

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => (
        <FormItem className={wrapperClassName}>
          <FormLabel className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-[#F4781B]">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              type={type}
              placeholder={placeholder}
              className={`mt-1 ${className}`}
            />
          </FormControl>
          <FormMessage className="text-red-600 text-xs font-medium mt-1" />
        </FormItem>
      )}
    />
  );
}

