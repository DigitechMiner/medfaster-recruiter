"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeDollarSign, Briefcase, Layers, Percent, Tag } from "lucide-react";
import { AppLayout } from "@/components/global/app-layout";
import { TableTabs } from "@/components/table/TableTabs";
import { MetricCard } from "@/components/ui/metric-card";
import { getJobFeesSummary } from "@/features/jobs";
import type { FeesSummaryData } from "@/features/jobs";
import { useAuthStore } from "@/stores/authStore";
import { ExperienceFeesTable } from "./components/experience-fees-table";
import { InstantFeesTable } from "./components/instant-fees-table";
import {
  FeesErrorState,
  FeesLoadingState,
  FeesSearchInput,
  FeesTabPanelHeader,
} from "./components/fees-ui";
import {
  countDiscountedTiers,
  FEES_TABS,
  FeesTabKey,
  filterFeeJobs,
  isInstantFees,
  isStandardFees,
} from "./helpers";

export default function FeesPage() {
  const router = useRouter();
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const [activeTab, setActiveTab] = useState<FeesTabKey>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataByTab, setDataByTab] = useState<Partial<Record<FeesTabKey, FeesSummaryData>>>({});
  const [loadingTab, setLoadingTab] = useState<FeesTabKey | null>("default");
  const [errorByTab, setErrorByTab] = useState<Partial<Record<FeesTabKey, string>>>({});
  const loadedTabsRef = useRef<Set<FeesTabKey>>(new Set());

  useEffect(() => {
    if (!recruiterProfile) {
      router.replace("/");
    }
  }, [recruiterProfile, router]);

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  useEffect(() => {
    if (!recruiterProfile) return;
    if (loadedTabsRef.current.has(activeTab)) return;

    let cancelled = false;

    async function loadFees() {
      setLoadingTab(activeTab);
      setErrorByTab((prev) => ({ ...prev, [activeTab]: undefined }));

      try {
        const data = await getJobFeesSummary(activeTab);
        if (cancelled) return;
        loadedTabsRef.current.add(activeTab);
        setDataByTab((prev) => ({ ...prev, [activeTab]: data }));
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Unable to fetch fee summary";
        setErrorByTab((prev) => ({ ...prev, [activeTab]: message }));
      } finally {
        if (!cancelled) setLoadingTab(null);
      }
    }

    void loadFees();

    return () => {
      cancelled = true;
    };
  }, [activeTab, recruiterProfile]);

  const activeTabMeta = FEES_TABS.find((tab) => tab.key === activeTab)!;
  const currentData = dataByTab[activeTab] ?? null;
  const currentError = errorByTab[activeTab];
  const isLoading = loadingTab === activeTab;

  const standardFees = isStandardFees(currentData) ? currentData : null;
  const instantFees = isInstantFees(currentData) ? currentData : null;
  const standardJobTitles = standardFees?.job_titles ?? [];
  const instantJobTitles = instantFees?.job_titles ?? [];
  const experienceLevels = standardFees?.experience_levels ?? [];

  const tabJobTitles = activeTab === "instant" ? instantJobTitles : standardJobTitles;

  const filteredExperienceJobs = useMemo(
    () => filterFeeJobs(standardJobTitles, searchQuery),
    [standardJobTitles, searchQuery],
  );

  const filteredInstantJobs = useMemo(
    () => filterFeeJobs(instantJobTitles, searchQuery),
    [instantJobTitles, searchQuery],
  );

  const customJobCount = standardJobTitles.filter((job) => job.has_custom_rates).length;
  const discountedTierCount = countDiscountedTiers(standardJobTitles);
  const overrideStatus = standardFees?.has_custom_rates
    ? "Custom rates active"
    : "Platform rates only";

  if (!recruiterProfile) {
    return null;
  }

  return (
    <AppLayout padding="none">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-3 sm:p-4 md:p-5 xl:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-[#F4781B] ring-1 ring-orange-100">
                <BadgeDollarSign className="size-5" aria-hidden />
              </div>
              <h1 className="text-2xl font-bold leading-8 text-gray-900">Fee Rates</h1>
            </div>
            <p className="max-w-2xl text-sm text-gray-500">
              Compare your hourly rate by experience. Job titles are shortened in the table.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            icon={<Briefcase className="size-5" />}
            title="Job titles"
            value={isLoading ? "—" : tabJobTitles.length}
            subLabel="In this view"
            loading={isLoading}
          />
          <MetricCard
            icon={<Tag className="size-5" />}
            title="Custom job rates"
            value={isLoading ? "—" : activeTab === "default" ? customJobCount : "—"}
            subLabel={activeTab === "default" ? "Titles with overrides" : "Standard jobs only"}
            loading={isLoading}
          />
          <MetricCard
            icon={<Percent className="size-5" />}
            title="Discounted tiers"
            value={isLoading ? "—" : activeTab === "default" ? discountedTierCount : "—"}
            subLabel={activeTab === "default" ? "Experience bands with savings" : "Not applicable"}
            loading={isLoading}
          />
          <MetricCard
            icon={<Layers className="size-5" />}
            title="Rate structure"
            value={isLoading ? "—" : activeTab === "default" ? overrideStatus : "Instant flat rate"}
            loading={isLoading}
            valueClassName="text-base sm:text-lg"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-2 sm:px-4">
            <TableTabs
              tabs={FEES_TABS.map((tab) => ({
                key: tab.key,
                label: (
                  <span className="inline-flex items-center gap-2">
                    <tab.icon className="size-4" aria-hidden />
                    {tab.label}
                  </span>
                ),
              }))}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabClassName="relative px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap sm:px-5"
            />
          </div>

          <FeesTabPanelHeader
            icon={activeTabMeta.icon}
            title={activeTabMeta.label}
            description={activeTabMeta.description}
            countLabel={
              isLoading
                ? undefined
                : `${tabJobTitles.length} job title${tabJobTitles.length === 1 ? "" : "s"}`
            }
            endSlot={
              !isLoading && !currentError ? (
                <FeesSearchInput value={searchQuery} onChange={setSearchQuery} />
              ) : undefined
            }
          />

          {isLoading ? (
            <FeesLoadingState />
          ) : currentError ? (
            <FeesErrorState message={currentError} />
          ) : activeTab === "default" ? (
            <ExperienceFeesTable
              jobTitles={filteredExperienceJobs}
              experienceLevels={experienceLevels}
              emptyMessage={
                searchQuery
                  ? "No job titles match your search."
                  : "No standard job fees are available."
              }
            />
          ) : (
            <InstantFeesTable
              jobTitles={filteredInstantJobs}
              emptyMessage={
                searchQuery
                  ? "No job titles match your search."
                  : "No instant job fees are available."
              }
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
