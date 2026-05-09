"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  /** On the same row as the label, right-aligned (e.g. secondary action). */
  labelEnd?: ReactNode;
  /** Inside the input on the right (e.g. status badge). Adds right padding to the field. */
  inputEnd?: ReactNode;
}

export default function FormInput({
  name,
  label,
  required = false,
  placeholder,
  type = "text",
  className = "",
  wrapperClassName = "",
  disabled = false,
  readOnly = false,
  value,
  labelEnd,
  inputEnd,
}: FormInputProps) {
  const methods = useFormContext();

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => (
        <FormItem className={wrapperClassName}>
          {labelEnd ? (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <FormLabel className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-[#F4781B]">*</span>}
              </FormLabel>
              <div className="flex shrink-0 items-center gap-2">{labelEnd}</div>
            </div>
          ) : (
            <FormLabel className="text-sm font-medium text-gray-700">
              {label} {required && <span className="text-[#F4781B]">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative mt-1">
              <Input
                {...field}
                value={value ?? field.value ?? ""}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(
                  inputEnd && "pr-28 sm:pr-32",
                  className,
                )}
              />
              {inputEnd ? (
                <div className="pointer-events-none absolute inset-y-0 right-1.5 z-[1] flex items-center justify-end gap-1.5">
                  <span className="pointer-events-auto flex shrink-0 items-center gap-1.5">{inputEnd}</span>
                </div>
              ) : null}
            </div>
          </FormControl>
          <FormMessage className="text-red-600 text-xs font-medium mt-1" />
        </FormItem>
      )}
    />
  );
}
