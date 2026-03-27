// app/candidates/page.tsx
"use client";

import { CandidatesBoard } from "./[id]/components/CandidatesBoard";
import { Navbar } from "@/components/global/navbar";

export default function CandidatesPage() {
  return (
    <>
      <Navbar />
      <div
        className="p-6 bg-gray-50 overflow-y-auto"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-5">Candidates</h1>
        <CandidatesBoard />
      </div>
    </>
  );
}