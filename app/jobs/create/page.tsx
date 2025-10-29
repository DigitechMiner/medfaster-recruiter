'use client'
import { useState } from "react";
import { CreateJobForm } from "../components/jobs/create-job-form";
import { Footer } from "../components/jobs/footer";
import { Navbar } from "../components/jobs/navbar";
import { Button } from "@/components/ui/button";
import SuccessModal from "../components/job-success-modal";


export default function CreateJobPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
    return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header with Actions */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Create Job post
            </h1>
          </div>
          <CreateJobForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
