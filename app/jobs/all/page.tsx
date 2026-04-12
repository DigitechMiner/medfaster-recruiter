'use client';
import { AppLayout } from '@/components/global/app-layout';
import { JobsAllPage } from './components/JobsAllPage';

export default function JobsAllPageWrapper() {
  return (
    <AppLayout>
      <JobsAllPage />
    </AppLayout>
  );
}