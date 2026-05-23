"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { useMetadataStore } from "@/stores/metadataStore";
import type { InstantJobFormData, Province } from "@/types";
import {
  CDSW_NEIGHBORHOOD_TYPES,
  DEFAULT_NEIGHBORHOOD_TYPES,
} from "@/utils/constant/metadata";
import { DateRangePicker } from "../components/date-picker";
import {
  JobFormField,
  JobFormInput,
  JobFormPickerButton,
  JobFormSelect,
} from "../components/form-field";
import { CustomTimePicker } from "../components/time-picker";
import {
  isBlockedNumberOfHiresKey,
  MIN_NUMBER_OF_HIRES,
  normalizeNumberOfHiresInput,
} from "../form/utils";
import type { JobFormFieldErrors } from "../validation";
import {
  clampInstantBreakDurationMinutes,
  getInstantBreakDurationBounds,
} from "./build-instant-payload";

interface InstantBasicStepProps {
  formData: InstantJobFormData;
  updateFormData: (updates: Partial<InstantJobFormData>) => void;
  fieldErrors?: JobFormFieldErrors<InstantJobFormData>;
  payRateCents?: number | null;
  payRateLoading?: boolean;
  payRateError?: string | null;
}

export function InstantBasicStep({
  formData,
  updateFormData,
  fieldErrors = {},
  payRateCents = null,
  payRateLoading = false,
  payRateError = null,
}: InstantBasicStepProps) {
  const {
    departments,
    jobTitles,
    jobTitlesForDepartment,
    loading,
    provinceOptions,
  } = useMetadataStore();
  const departmentJobTitles = jobTitlesForDepartment(formData.department ?? "");

  const today = new Date();

  const [showCalendar, setShowCalendar] = useState(false);
  const [dateEditMode, setDateEditMode] = useState<"start" | "end">("start");
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  const formatDate = (date?: Date | string) => {
    if (!date) return "MM/DD/YYYY";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "MM/DD/YYYY";
    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeDisplay = (time?: string, placeholder = "Select time") => {
    if (!time) return placeholder;
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "pm" : "am";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleDepartmentChange = (value: string) => {
    updateFormData({ department: value, job_title: "" });
  };

  const allTitles = departmentJobTitles.length
    ? departmentJobTitles
    : jobTitles;
  const selectedTitleLabel =
    allTitles.find((t) => t.value === formData.job_title)?.label ?? "";

  const isCDSW =
    selectedTitleLabel
      .toLowerCase()
      .includes("community disability support worker") ||
    selectedTitleLabel.toUpperCase().includes("CDSW");

  const neighbourhoodTypes = isCDSW
    ? CDSW_NEIGHBORHOOD_TYPES
    : DEFAULT_NEIGHBORHOOD_TYPES;

  const currentTypeValid = neighbourhoodTypes.some(
    (type) => type === formData.neighborhood_type,
  );

  useEffect(() => {
    if (formData.neighborhood_type && !currentTypeValid) {
      updateFormData({ neighborhood_type: "" });
    }
  }, [currentTypeValid, formData.neighborhood_type, updateFormData]);

  const payRateDisplay =
    payRateCents !== null ? `$${(payRateCents / 100).toFixed(2)} / hr` : "-";

  const breakBounds = useMemo(
    () =>
      getInstantBreakDurationBounds(
        formData.check_in_time,
        formData.check_out_time,
      ),
    [formData.check_in_time, formData.check_out_time],
  );

  const breakValue =
    formData.break_duration_minutes !== undefined
      ? String(formData.break_duration_minutes)
      : "";

  useEffect(() => {
    const current = formData.break_duration_minutes;
    if (current === undefined) return;

    if (current < breakBounds.min || current > breakBounds.max) {
      updateFormData({ break_duration_minutes: breakBounds.default });
      return;
    }

    const clamped = clampInstantBreakDurationMinutes(
      current,
      formData.check_in_time,
      formData.check_out_time,
    );
    if (clamped !== undefined && clamped !== current) {
      updateFormData({ break_duration_minutes: clamped });
    }
  }, [
    breakBounds,
    formData.check_in_time,
    formData.check_out_time,
    formData.break_duration_minutes,
    updateFormData,
  ]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <JobFormSelect
          id="department"
          label="Department"
          value={formData.department}
          onValueChange={handleDepartmentChange}
          options={departments.map(({ uuid, label, value }, index) => ({
            key: `${uuid}-${value}-${index}`,
            label,
            value,
          }))}
          placeholder={loading ? "Loading..." : "Select"}
          triggerClassName="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
          required
          error={fieldErrors.department}
        />

        <JobFormSelect
          id="job-title"
          label="Job Role"
          value={formData.job_title}
          onValueChange={(value) => updateFormData({ job_title: value })}
          options={departmentJobTitles.map(({ uuid, label, value }, index) => ({
            key: `${uuid}-${value}-${index}`,
            label,
            value,
          }))}
          placeholder={loading ? "Loading..." : "Select"}
          disabled={!formData.department || loading}
          triggerClassName="w-full border-[#F4781B] focus:ring-[#F4781B] h-11"
          required
          error={fieldErrors.job_title}
        />

        <JobFormPickerButton
          id="shift-start-date"
          label="Shift Start Date"
          displayValue={formatDate(formData.start_date)}
          icon={
            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          }
          onClick={() => {
            setDateEditMode("start");
            setShowCalendar(true);
          }}
          required
          error={fieldErrors.start_date}
        />

        <JobFormPickerButton
          id="shift-end-date"
          label="Shift End Date"
          displayValue={formatDate(formData.end_date)}
          icon={
            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          }
          onClick={() => {
            setDateEditMode("end");
            setShowCalendar(true);
          }}
          required
          error={fieldErrors.end_date}
        />

        <JobFormPickerButton
          id="shift-check-in-time"
          label="Shift Check-In Time"
          displayValue={formatTimeDisplay(
            formData.check_in_time,
            "Select start time",
          )}
          icon={<Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          onClick={() => setShowFromTimePicker(true)}
          required
          error={fieldErrors.check_in_time}
        />

        <JobFormPickerButton
          id="shift-check-out-time"
          label="Shift Check-Out Time"
          displayValue={formatTimeDisplay(
            formData.check_out_time,
            "Select end time",
          )}
          icon={<Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          onClick={() => setShowToTimePicker(true)}
          required
          error={fieldErrors.check_out_time}
        />

        <JobFormInput
          id="break-duration-minutes"
          label={
            <>
              Break Duration (minutes)
              <span className="ml-1 font-normal text-gray-400">
                ({breakBounds.min}–{breakBounds.max} min)
              </span>
            </>
          }
          type="number"
          min={breakBounds.min}
          max={breakBounds.max}
          step={1}
          value={breakValue}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              updateFormData({ break_duration_minutes: undefined });
              return;
            }
            const num = Number(raw);
            if (!Number.isFinite(num)) return;
            updateFormData({
              break_duration_minutes: clampInstantBreakDurationMinutes(
                num,
                formData.check_in_time,
                formData.check_out_time,
              ),
            });
          }}
          onBlur={() => {
            const current = formData.break_duration_minutes;
            if (current === undefined) {
              updateFormData({
                break_duration_minutes: breakBounds.default,
              });
              return;
            }
            const clamped = clampInstantBreakDurationMinutes(
              current,
              formData.check_in_time,
              formData.check_out_time,
            );
            if (clamped !== undefined && clamped !== current) {
              updateFormData({ break_duration_minutes: clamped });
            }
          }}
          placeholder={String(breakBounds.default)}
          required
          error={fieldErrors.break_duration_minutes}
        />

        <JobFormInput
          id="no-of-hires"
          label="Requirements For This Position"
          type="number"
          min={MIN_NUMBER_OF_HIRES}
          step={1}
          value={formData.no_of_hires_required || ""}
          onKeyDown={(e) => {
            if (isBlockedNumberOfHiresKey(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) =>
            updateFormData({
              no_of_hires_required: normalizeNumberOfHiresInput(e.target.value),
            })
          }
          placeholder="1"
          required
          error={fieldErrors.no_of_hires_required}
        />

        <JobFormField id="hourly-pay" label="Hourly Pay per Hire">
          <div
            id="hourly-pay"
            className="h-11 flex items-center px-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm select-none"
          >
            {payRateLoading && (
              <span className="animate-pulse text-gray-400">Loading...</span>
            )}
            {payRateError && (
              <span className="text-red-500 text-xs">{payRateError}</span>
            )}
            {!payRateLoading && !payRateError && (
              <span
                className={
                  payRateCents !== null
                    ? "font-semibold text-gray-800"
                    : "text-gray-400"
                }
              >
                {formData.job_title
                  ? payRateDisplay
                  : "Select a job title first"}
              </span>
            )}
          </div>
        </JobFormField>

        <JobFormInput
          id="neighborhood-name"
          label="Name of Neighborhood"
          type="text"
          value={formData.neighborhood_name || ""}
          onChange={(e) =>
            updateFormData({ neighborhood_name: e.target.value })
          }
          placeholder="Enter Neighbourhood Name"
          error={fieldErrors.neighborhood_name}
        />

        <JobFormSelect
          id="neighborhood-type"
          label={
            <>
              Type of Neighbourhood
              {isCDSW && (
                <span className="ml-2 text-[10px] font-semibold text-[#F4781B] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                  CDSW
                </span>
              )}
            </>
          }
          value={formData.neighborhood_type || ""}
          onValueChange={(value) =>
            updateFormData({ neighborhood_type: value })
          }
          options={neighbourhoodTypes.map((type) => ({
            label: type,
            value: type,
          }))}
          placeholder="Select"
          error={fieldErrors.neighborhood_type}
        />

        <JobFormInput
          id="direct-number"
          label="Direct Number"
          type="tel"
          value={formData.direct_number || ""}
          onChange={(e) => updateFormData({ direct_number: e.target.value })}
          placeholder="123-456-7890"
          required
          error={fieldErrors.direct_number}
        />

        <JobFormInput
          id="street-address"
          label="Street Address"
          type="text"
          value={formData.street || ""}
          onChange={(e) => updateFormData({ street: e.target.value })}
          placeholder="1234 Maple Street"
          error={fieldErrors.street}
        />

        <JobFormInput
          id="city"
          label="City"
          type="text"
          value={formData.city || ""}
          onChange={(e) => updateFormData({ city: e.target.value })}
          placeholder="Toronto"
          required
          error={fieldErrors.city}
        />

        <JobFormSelect
          id="province"
          label="Province"
          value={formData.province || ""}
          onValueChange={(value) =>
            updateFormData({ province: value as Province })
          }
          options={provinceOptions.map((p) => ({
            label: p.label,
            value: p.value,
          }))}
          placeholder="Select Province"
          triggerClassName="h-11 border-[#F4781B]"
          required
          error={fieldErrors.province}
        />

        <JobFormInput
          id="postal-code"
          label="Postal Code"
          type="text"
          value={formData.postal_code || ""}
          onChange={(e) => updateFormData({ postal_code: e.target.value })}
          placeholder="M5H 2N2"
          required
          error={fieldErrors.postal_code}
        />
        <JobFormInput
          id="country"
          label="Country"
          type="text"
          value={formData.country || "Canada"}
          disabled
          className="h-11 bg-gray-50 text-gray-500"
          required
        />
      </div>

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <DateRangePicker
            fromDate={formData.start_date}
            tillDate={formData.end_date}
            minDate={today}
            editMode={dateEditMode}
            onChange={(from, till) =>
              updateFormData({ start_date: from, end_date: till })
            }
            onCancel={() => setShowCalendar(false)}
            onApply={() => setShowCalendar(false)}
          />
        </div>
      )}

      {showFromTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.check_in_time}
            onSelect={(time) => updateFormData({ check_in_time: time })}
            onCancel={() => setShowFromTimePicker(false)}
            onSelectTime={() => setShowFromTimePicker(false)}
          />
        </div>
      )}

      {showToTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CustomTimePicker
            selectedTime={formData.check_out_time}
            onSelect={(time) => updateFormData({ check_out_time: time })}
            onCancel={() => setShowToTimePicker(false)}
            onSelectTime={() => setShowToTimePicker(false)}
          />
        </div>
      )}
    </>
  );
}
