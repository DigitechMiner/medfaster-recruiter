"use client";
import { AppLayout } from "@/components/global/app-layout";
import { CandidatesBoard } from "./[id]/components/CandidatesBoard";
import { useRouter } from "next/navigation";

export default function CandidatesPage() {
  const router = useRouter();
  return (
    <AppLayout padding="sm">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <button
          onClick={() => router.push("/candidates/add")}
          className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          + Add My In-House Staff
        </button>
      </div>
      <CandidatesBoard />
    </AppLayout>
  );
}