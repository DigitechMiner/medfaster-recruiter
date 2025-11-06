"use client";

import { Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormMessage, FormField, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  description?: string;
  required?: boolean;
  iconSize?: "small" | "medium";
}

export default function FileUpload({
  name,
  label,
  accept = "image/*",
  description = "Supports images, max 5MB per file.",
  required = false,
  iconSize = "medium",
}: FileUploadProps) {
  const methods = useFormContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    } else {
      onChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, onChange: (value: File | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const iconClass = iconSize === "small" ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-8 sm:h-8";
  const paddingClass = iconSize === "small" ? "p-4 sm:p-6" : "p-6 sm:p-8";

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => {
        const { onChange } = field;
        return (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-[#F4781B]">*</span>}
          </FormLabel>
          <FormControl>
            <div 
              className={`border-2 border-dashed border-gray-200 rounded-lg ${paddingClass} text-center hover:border-gray-300 transition-colors relative cursor-pointer`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, onChange)}
            >
              <Upload className={`${iconClass} mx-auto mb-2 text-gray-400`} />
              <p className="text-xs sm:text-sm">
                <label htmlFor={`${name}-upload`} className="text-orange-600 font-medium cursor-pointer">
                  Click to upload
                </label>{" "}
                <span className="hidden sm:inline">or drag and drop</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 px-2">{description}</p>
              <Input
                type="file"
                id={`${name}-upload`}
                className="hidden"
                accept={accept}
                onChange={(e) => handleFileChange(e, onChange)}
              />
            </div>
          </FormControl>
          <FormMessage className="text-red-600 text-xs font-medium mt-1" />
        </FormItem>
        );
      }}
    />
  );
}
