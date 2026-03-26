"use client";
import { CandidatesBoard } from "./[id]/components/CandidatesBoard";

export default function CandidatesPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Candidates</h1>
      <CandidatesBoard />
    </div>
  );
}
