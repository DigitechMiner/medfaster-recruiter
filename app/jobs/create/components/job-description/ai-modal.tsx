"use client";

import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIDescriptionModalProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  description: string;
  onClose: () => void;
  onRegenerate: () => void | Promise<void>;
  onUse: () => void;
}

export function AIDescriptionModal({
  open,
  loading,
  error,
  description,
  onClose,
  onRegenerate,
  onUse,
}: AIDescriptionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F4781B]" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              AI Generated Description
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#F4781B] animate-spin mb-4" />
              <p className="text-gray-600 text-center">
                Generating job description with AI...
              </p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
              <Button
                onClick={onRegenerate}
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
                  ✨ Generated based on your job details — this will also fill in Key
                  Responsibilities, Skills, Experience and more.
                </p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {description}
              </div>
            </div>
          )}
        </div>

        {description && !loading && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200">
            <Button
              onClick={onRegenerate}
              variant="ghost"
              className="flex-1 h-10 border-gray-300"
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              onClick={onUse}
              className="flex-1 h-10 bg-[#F4781B] hover:bg-orange-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Use This Description
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
