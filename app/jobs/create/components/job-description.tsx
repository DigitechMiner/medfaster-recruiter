"use client";

import { useState } from "react";
import { Sparkles, X, Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { JobDescriptionInput } from "@/stores/api/job-description.api";
import type { JobFormData } from "@/Interface/job.types"; // ADD THIS

// REMOVE local FormData interface - DELETE THIS
// interface FormData { ... }

interface JobDescriptionProps {
  formData: JobFormData; // CHANGE from FormData
  updateFormData: (updates: Partial<JobFormData>) => void; // CHANGE from FormData
}

export function JobDescription({
  formData,
  updateFormData,
}: JobDescriptionProps) {
  const [showModal, setShowModal] = useState(false);
  const { description, loading, error, generateDescription, reset } = useGenerateDescription();

  const handleGenerateWithAI = async () => {
    // Validate required fields
    if (!formData.jobTitle || !formData.department || !formData.jobType) {
      alert("Please fill in Job Title, Department, and Job Type before generating with AI");
      return;
    }

    setShowModal(true);

    // Map job type format
    let jobType = formData.jobType.toLowerCase().replace(/\s+/g, '');
    if (jobType === 'fulltime') jobType = 'Full Time';
    else if (jobType === 'parttime') jobType = 'Part Time';
    else jobType = formData.jobType;

    const input: JobDescriptionInput = {
      jobTitle: formData.jobTitle,
      department: formData.department,
      jobType: jobType,
      location: formData.location || undefined,
      payRange: `$${formData.payRange[0]} - $${formData.payRange[1]}`,
      experienceRequired: formData.experience || undefined,
      qualification: formData.qualification.join(', ') || undefined,
      specialization: formData.specialization.join(', ') || undefined,
      urgency: formData.urgency || undefined,
      inPersonInterview: formData.inPersonInterview === 'Yes',
      physicalInterview: formData.physicalInterview === 'Yes',
    };

    await generateDescription(input);
  };

  const handleUse = () => {
    if (description) {
      updateFormData({ description });
      handleClose();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const handleRegenerate = async () => {
    reset();
    await handleGenerateWithAI();
  };

  return (
    <>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateWithAI}
            disabled={loading}
            className="text-[#F4781B] hover:text-orange-600 hover:bg-orange-50 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 -mt-1 sm:mt-0"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Generate with AI
          </Button>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Enter job description or generate with AI..."
          className="w-full min-h-[120px] sm:min-h-[140px] resize-none text-sm"
          rows={5}
        />
      </div>

      {/* AI Generator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F4781B]" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  AI Generated Description
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-[#F4781B] animate-spin mb-4" />
                  <p className="text-gray-600 text-center">
                    Generating job description with AI...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few seconds
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                  <Button
                    onClick={handleRegenerate}
                    variant="ghost"
                    className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {description && !loading && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800 mb-2 font-medium">
                      ✨ Generated based on your job details
                    </p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                      {description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {description && !loading && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200">
                <Button
                  onClick={handleRegenerate}
                  variant="ghost"
                  className="flex-1 h-10 border-gray-300"
                  disabled={loading}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleUse}
                  className="flex-1 h-10 bg-[#F4781B] hover:bg-orange-600 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Description
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
