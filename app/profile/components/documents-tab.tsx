"use client";

import type { ChangeEvent, RefObject } from "react";
import { AlertCircle, CheckCircle2, Eye, FileText, Plus } from "lucide-react";

import { complianceFields } from "@/components/forms";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecruiterDocument } from "@/stores/api/recruiter-api";

type ProfileDocumentsTabProps = {
  documents: RecruiterDocument[];
  docType: string;
  onDocTypeChange: (value: string) => void;
  isAddingDoc: boolean;
  onSetAddingDoc: (value: boolean) => void;
  docInputRef: RefObject<HTMLInputElement | null>;
  onDocumentUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onViewDocument: (doc: RecruiterDocument) => void;
};

export function ProfileDocumentsTab({
  documents,
  docType,
  onDocTypeChange,
  isAddingDoc,
  onSetAddingDoc,
  docInputRef,
  onDocumentUpload,
  onViewDocument,
}: ProfileDocumentsTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Organization compliance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id}>
              <label className="text-sm font-medium text-gray-700 block mb-2 capitalize">
                {doc.document_type.replace(/_/g, " ")} <span className="text-[#f47b20]">*</span>
              </label>
              <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                <div className="bg-red-50 text-red-500 p-2 rounded flex-shrink-0">
                  <FileText className="w-6 h-6" />
                  <span className="text-[10px] font-bold block text-center mt-1">DOC</span>
                </div>
                <div className="min-w-0 flex-1 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate capitalize">
                      {doc.document_type.replace(/_/g, " ")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void onViewDocument(doc)}
                      className="mt-1 text-green-600 flex items-center gap-1 hover:underline text-xs"
                    >
                      <Eye className="w-3 h-3 shrink-0" aria-hidden />
                      View Document
                    </button>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 self-start border-transparent capitalize [&>svg]:size-3.5",
                      doc.status === "verified"
                        ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/15"
                        : "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20"
                    )}
                  >
                    {doc.status === "verified" ? (
                      <CheckCircle2 aria-hidden />
                    ) : (
                      <AlertCircle aria-hidden />
                    )}
                    {doc.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic col-span-2">No compliance documents found.</p>
        )}
      </div>

      {isAddingDoc && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={docType}
            onChange={(e) => onDocTypeChange(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#f47b20]"
          >
            {complianceFields.map((f) => (
              <option key={f.name} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[#f47b20] text-white rounded-md text-sm font-medium hover:bg-[#d5650e] transition-colors"
          >
            <Plus className="w-4 h-4" /> Choose File
          </button>
          <button
            type="button"
            onClick={() => onSetAddingDoc(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={onDocumentUpload}
      />

      <button
        type="button"
        onClick={() => onSetAddingDoc(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add More Documents
      </button>
    </div>
  );
}
