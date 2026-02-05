"use client";

import { Upload, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormMessage, FormField, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { validateOrganizationPhoto, validateDocumentFile, formatFileSize } from "@/utils/constant/metadata";
import { useState, useRef } from "react"; // ✅ Added useRef

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  description?: string;
  required?: boolean;
  iconSize?: "small" | "medium";
  fileType?: "photo" | "document";
}

export default function FileUpload({
  name,
  label,
  accept = "image/*",
  description = "Supports images, max 5MB per file.",
  required = false,
  iconSize = "medium",
  fileType = "document",
}: FileUploadProps) {
  const methods = useFormContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // ✅ Added ref

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const validation = fileType === "photo" 
        ? validateOrganizationPhoto(file)
        : validateDocumentFile(file);
      
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        onChange(null);
        setSelectedFile(null);
        return;
      }
      
      setError(null);
      onChange(file);
      setSelectedFile(file);
    } else {
      onChange(null);
      setSelectedFile(null);
    }
  };

  const handleRemove = (onChange: (value: File | null) => void) => {
    onChange(null);
    setSelectedFile(null);
    setError(null);
  };

  // ✅ NEW: Handle click on entire box
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, onChange: (value: File | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      const validation = fileType === "photo" 
        ? validateOrganizationPhoto(file)
        : validateDocumentFile(file);
      
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        onChange(null);
        setSelectedFile(null);
        return;
      }
      
      setError(null);
      onChange(file);
      setSelectedFile(file);
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
            <div>
              <div 
                className={`border-2 border-dashed rounded-lg ${paddingClass} text-center transition-colors cursor-pointer ${
                  error ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, onChange)}
                onClick={handleBoxClick} // ✅ Click entire box to open file picker
              >
                {selectedFile ? (
                  <div 
                    className="flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()} // ✅ Prevent box click when file selected
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ Prevent box click when removing
                        handleRemove(onChange);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className={`${iconClass} mx-auto mb-2 ${error ? "text-red-400" : "text-gray-400"}`} />
                    <p className="text-xs sm:text-sm">
                      <span className="text-orange-600 font-medium">Click to upload</span>{" "}
                      <span className="hidden sm:inline">or drag and drop</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 px-2">{description}</p>
                  </>
                )}
                <Input
                  type="file"
                  ref={fileInputRef} // ✅ Added ref
                  id={`${name}-upload`}
                  className="hidden"
                  accept={accept}
                  onChange={(e) => handleFileChange(e, onChange)}
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs font-medium mt-1">{error}</p>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-red-600 text-xs font-medium mt-1" />
        </FormItem>
        );
      }}
    />
  );
}
