"use client";

import FileUpload from "../components/FileUpload";
import { complianceFields } from "../const";

export default function ComplianceVerificationStep() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {complianceFields.map((field) => (
        <FileUpload
          key={field.name}
          name={field.name}
          label={field.label}
          accept=".pdf,image/*"
          description="Supports PDF/images, max 10MB per file."
          required
          iconSize="small"
        />
      ))}
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add More Certificate
        </button>
      </div>
    </div>
    
  );
}

