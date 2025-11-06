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
    </div>
  );
}

