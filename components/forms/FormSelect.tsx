"use client";

import { useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export default function FormSelect({
  name,
  label,
  options,
  required = false,
  placeholder = "Select...",
  className = "",
  wrapperClassName = "",
  disabled = false,
  emptyMessage = "No options available",
}: FormSelectProps) {
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
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
              disabled={disabled}
            >
              <SelectTrigger className={`mt-1 ${className}`}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.length > 0 ? (
                  options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <p className="px-3 py-4 text-center text-sm text-gray-500">
                    {emptyMessage}
                  </p>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage className="text-red-600 text-xs font-medium mt-1" />
        </FormItem>
      )}
    />
  );
}
