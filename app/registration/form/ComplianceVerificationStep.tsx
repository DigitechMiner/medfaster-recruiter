"use client";

import { useState } from "react";
import FileUpload from "../components/FileUpload";
import { complianceFields } from "../const";

export default function ComplianceVerificationStep() {
  const [showOptionalCertificate, setShowOptionalCertificate] = useState(false);
  const primaryFields = complianceFields.slice(0, 2);
  const optionalField = complianceFields[2];

  return (
    <>
      <h3 className="text-2xl font-bold text-gray-900 mb-5">Compliance Verification</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {primaryFields.map((field) => (
          <FileUpload
            key={field.name}
            name={field.name}
            label={field.label}
            accept=".pdf,image/*"
            description="Supports PDF/images, max 10MB per file."
            required={field.required}
            iconSize="small"
          />
        ))}
      </div>

      {showOptionalCertificate && optionalField && (
        <div className="mt-4 max-w-[420px]">
          <FileUpload
            name={optionalField.name}
            label={optionalField.label}
            accept=".pdf,image/*"
            description="Supports PDF/images, max 10MB per file."
            required={optionalField.required}
            iconSize="small"
          />
        </div>
      )}

      {!showOptionalCertificate && optionalField && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowOptionalCertificate(true)}
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
            Add More Documents
          </button>
        </div>
      )}
    </>
  );
}

