"use client";

import { AppLayout } from "@/components/global/app-layout";
import JobsPage from "../components/JobsPage";


export default function ActiveJobsRoute() {
  return (
    <AppLayout>
      <JobsPage />
    </AppLayout>
  );
}
