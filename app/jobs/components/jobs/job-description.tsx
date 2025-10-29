"use client";

import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FormData {
  description: string;
}

interface JobDescriptionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function JobDescription({
  formData,
  updateFormData,
}: JobDescriptionProps) {
  const handleGenerateWithAI = () => {
    console.log("Generate with AI clicked");
  };

  return (
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
          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 -mt-1 sm:mt-0"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Generate with AI
        </Button>
      </div>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => updateFormData({ description: e.target.value })}
        placeholder="Enter job description..."
        className="w-full min-h-[120px] sm:min-h-[140px] resize-none text-sm"
        rows={5}
      />
    </div>
  );
}
