"use client";

import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobFormFieldProps {
  id?: string;
  label: ReactNode;
  required?: boolean;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function JobFormField({
  id,
  label,
  required,
  error,
  className = "space-y-2",
  children,
}: JobFormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

type JobFormInputProps = ComponentProps<typeof Input> & {
  label: ReactNode;
  error?: ReactNode;
  fieldClassName?: string;
};

export function JobFormInput({
  label,
  error,
  fieldClassName,
  className,
  required,
  ...inputProps
}: JobFormInputProps) {
  return (
    <JobFormField
      id={inputProps.id}
      label={label}
      required={required}
      error={error}
      className={fieldClassName}
    >
      <Input className={className ?? "h-11"} required={required} {...inputProps} />
    </JobFormField>
  );
}

interface JobFormSelectOption {
  value: string;
  label: ReactNode;
  key?: string;
  disabled?: boolean;
  className?: string;
  suffix?: ReactNode;
}

interface JobFormSelectProps {
  id: string;
  label: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  options: JobFormSelectOption[];
  children?: ReactNode;
  placeholder?: string;
  required?: boolean;
  error?: ReactNode;
  disabled?: boolean;
  fieldClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  triggerContent?: ReactNode;
  emptyOptionsMessage?: ReactNode;
}

export function JobFormSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  children,
  placeholder = "Select",
  required,
  error,
  disabled,
  fieldClassName,
  triggerClassName = "h-11",
  contentClassName,
  triggerContent,
  emptyOptionsMessage = "No options available",
}: JobFormSelectProps) {
  const hasOptions = options.length > 0;

  return (
    <JobFormField
      id={id}
      label={label}
      required={required}
      error={error}
      className={fieldClassName}
    >
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={triggerClassName}>
          {triggerContent ?? <SelectValue placeholder={placeholder} />}
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {hasOptions ? (
            options.map((option) => (
              <SelectItem
                key={option.key ?? option.value}
                value={option.value}
                disabled={option.disabled}
                className={option.className}
              >
                {option.label}
                {option.suffix}
              </SelectItem>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-sm text-gray-500">
              {emptyOptionsMessage}
            </p>
          )}
        </SelectContent>
      </Select>
      {children}
    </JobFormField>
  );
}

interface JobFormPickerButtonProps {
  id?: string;
  label: ReactNode;
  displayValue: ReactNode;
  icon: ReactNode;
  onClick: () => void;
  required?: boolean;
  error?: ReactNode;
}

export function JobFormPickerButton({
  id,
  label,
  displayValue,
  icon,
  onClick,
  required,
  error,
}: JobFormPickerButtonProps) {
  return (
    <JobFormField id={id} label={label} required={required} error={error}>
      <button
        id={id}
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm h-11 hover:bg-gray-50 bg-white text-left"
      >
        <span className="text-gray-600">{displayValue}</span>
        {icon}
      </button>
    </JobFormField>
  );
}
