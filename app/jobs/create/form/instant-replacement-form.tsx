"use client";

import { useState } from "react";
import { useJobsStore } from "@/stores/jobs-store";
import { JobCreatePayload, JobFormData } from "@/Interface/job.types";
import { JobForm } from "../../components/JobForm";
import { InstantJobFields } from "../../instant-replacement/components/instant-job-fields";

interface Props {
  urgencyMode: "instant";
  onNext?: () => void;
  onBack?: () => void;
}

// FIX: Remove urgencyMode from destructuring since it's not used
export function InstantReplacementForm({ onNext, onBack }: Props) {
  const createJob = useJobsStore((state) => state.createJob);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Define interface for instant-specific fields
  interface InstantJobFormData extends JobFormData {
    numberOfHires?: string;
    amountPerHire?: string;
    checkInTime?: string;
    checkOutTime?: string;
    neighborhoodName?: string;
    neighborhoodType?: string;
    directNumber?: string;
    streetAddress?: string;
    postalCode?: string;
    province?: string;
    city?: string;
    country?: string;
  }

  const [formData, setFormData] = useState<InstantJobFormData>({
    jobTitle: "",
    department: "",
    jobType: "Full Time",
    location: "",
    payRange: [0, 0] as [number, number],
    experience: "",
    qualification: [],
    specialization: [],
    urgency: "instant",
    inPersonInterview: "Yes",
    physicalInterview: "Yes",
    description: "",
    status: "DRAFT", // Add this
    // Instant-specific
    numberOfHires: "5",
    amountPerHire: "50$",
    checkInTime: "07:30",
    checkOutTime: "07:30",
    neighborhoodName: "",
    neighborhoodType: "",
    directNumber: "265536727",
    streetAddress: "1234 Maple Street",
    postalCode: "M5H 2N2",
    province: "Ontario (ON)",
    city: "Ontario",
    country: "Canada",
  });

  const updateFormData = (updates: Partial<InstantJobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const formatDateForBackend = (date?: Date): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setError("Start and end dates are required");
      return;
    }
    
    if (endDate < startDate) {
      setError("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const backendData: JobCreatePayload = {
        job_title: formData.jobTitle,
        department: formData.department || null,
        job_type: "fulltime",
        location: `${formData.streetAddress}, ${formData.city}, ${formData.province}`,
        pay_range_min: Number(formData.amountPerHire?.replace(/\D/g, "")) || null,
        pay_range_max: Number(formData.amountPerHire?.replace(/\D/g, "")) || null,
        years_of_experience: null,
        qualifications: null,
        specializations: null,
        job_urgency: "instant",
        ai_interview: false, // Changed to false since instant jobs don't need AI interview
        in_person_interview: true,
        physical_interview: true,
        description: formData.description || null,
        questions: null,
        status: "DRAFT",
        no_of_hires: formData.numberOfHires ? parseInt(formData.numberOfHires) : null,
        start_date: formatDateForBackend(startDate),
        end_date: formatDateForBackend(endDate),
        check_in_time: formData.checkInTime,
        check_out_time: formData.checkOutTime,
      };

      const response = await createJob(backendData);

      if (response.success) {
        sessionStorage.setItem("createdJobId", response.data.job.id);
        if (onNext) onNext();
      } else {
        setError(response.message || "Failed to create instant replacement");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <JobForm
        mode="create"
        formData={formData}
        updateFormData={updateFormData}
        onSubmit={handleSubmit}
        onBack={onBack}
        onPreview={() => console.log("Preview", formData)}
        showBackButton={!!onBack}
        showNextButton={!isSubmitting}
        nextLabel={isSubmitting ? "Posting..." : "Post"}
        hideRequirements={true}
        hideInterviewSettings={true}
        customSections={
          <InstantJobFields
            formData={formData}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            updateFormData={updateFormData}
          />
        }
      />
    </>
  );
}
