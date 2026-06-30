"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateApplicationStatus } from "@/features/jobs";
import type { ApplicationStatus, ApplicationTeamPreference, HireShiftBand } from "@/types";
import { formatShiftTypeLabel } from "@/app/jobs/components/helper";
import {
  type ApplicationStatusAction,
  getApplicationStatusActionClassName,
  getApplicationStatusActionDescription,
  getApplicationStatusActionLabel,
  getApplicationStatusTransitions,
  getHireShiftBandOptions,
} from "./application-status-transitions";

type ApplicationStatusActionModalProps = {
  jobId: string;
  applicationId: string;
  candidateName: string;
  jobTitle?: string | null;
  currentStatus: ApplicationStatus;
  aiInterviewEnabled: boolean;
  open: boolean;
  teamPreferences?: ApplicationTeamPreference[];
  onClose: () => void;
  onSuccess: () => void;
};

const choiceClassName =
  "flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 has-[:checked]:border-[#F4781B] has-[:checked]:bg-orange-50 has-[:checked]:text-gray-900";

function HirePlacementForm({
  teamPreferences,
  selectedTeamId,
  selectedShiftBand,
  onTeamChange,
  onShiftChange,
}: {
  teamPreferences: ApplicationTeamPreference[];
  selectedTeamId: string;
  selectedShiftBand: string;
  onTeamChange: (teamId: string) => void;
  onShiftChange: (shiftBand: HireShiftBand) => void;
}) {
  const selectedTeam = teamPreferences.find((team) => team.team_id === selectedTeamId);
  const shiftBandOptions = getHireShiftBandOptions(selectedTeam?.shift_types);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Team</p>
        <div className="space-y-1.5">
          {teamPreferences.map((preference) => (
            <label
              key={preference.team_id}
              className={choiceClassName}
            >
              <input
                type="radio"
                name="hire-team"
                value={preference.team_id}
                checked={selectedTeamId === preference.team_id}
                onChange={() => onTeamChange(preference.team_id)}
                className="h-4 w-4 accent-[#F4781B]"
              />
              <span className="font-medium">{preference.team_name}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedTeam ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Shift band</p>
          {shiftBandOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {shiftBandOptions.map((shiftBand) => (
                <label
                  key={shiftBand}
                  className={`${choiceClassName} py-1.5`}
                >
                  <input
                    type="radio"
                    name="hire-shift"
                    value={shiftBand}
                    checked={selectedShiftBand === shiftBand}
                    onChange={() => onShiftChange(shiftBand)}
                    className="h-4 w-4 accent-[#F4781B]"
                  />
                  <span>{formatShiftTypeLabel(shiftBand)}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-700">No shift bands available for this team.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ApplicationStatusActionModal({
  jobId,
  applicationId,
  candidateName,
  jobTitle,
  currentStatus,
  aiInterviewEnabled,
  open,
  teamPreferences = [],
  onClose,
  onSuccess,
}: ApplicationStatusActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ApplicationStatusAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedShiftBand, setSelectedShiftBand] = useState("");

  const availableActions = getApplicationStatusTransitions(currentStatus, aiInterviewEnabled);
  const hasTeamPreferences = teamPreferences.length > 0;

  useEffect(() => {
    if (!open) {
      setSelectedAction(null);
      setSubmitError(null);
      setSelectedTeamId("");
      setSelectedShiftBand("");
      return;
    }

    setSelectedAction(null);
    setSubmitError(null);
    setSelectedTeamId("");
    setSelectedShiftBand("");
  }, [open, applicationId]);

  useEffect(() => {
    if (!open || selectedAction !== "HIRE" || !hasTeamPreferences) return;

    const firstTeam = teamPreferences[0];
    setSelectedTeamId(firstTeam?.team_id ?? "");
    setSelectedShiftBand(getHireShiftBandOptions(firstTeam?.shift_types)[0] ?? "");
  }, [open, selectedAction, hasTeamPreferences, teamPreferences]);

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const team = teamPreferences.find((preference) => preference.team_id === teamId);
    setSelectedShiftBand(getHireShiftBandOptions(team?.shift_types)[0] ?? "");
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (selectedAction === "HIRE") {
        if (hasTeamPreferences) {
          if (!selectedTeamId) throw new Error("Select a team to hire onto.");
          if (!selectedShiftBand) {
            throw new Error("Select a shift band for the chosen team.");
          }

          await updateApplicationStatus(jobId, applicationId, {
            status: "HIRE",
            hire_placement: {
              team_id: selectedTeamId,
              shift_type: selectedShiftBand as HireShiftBand,
            },
          });
        } else {
          await updateApplicationStatus(jobId, applicationId, { status: "HIRE" });
        }
      } else {
        await updateApplicationStatus(jobId, applicationId, { status: selectedAction });
      }

      onSuccess();
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(
        err?.response?.data?.message ?? err?.message ?? "Action failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const actionLabel = selectedAction
    ? getApplicationStatusActionLabel(selectedAction)
    : null;
  const canSubmitHire =
    selectedAction !== "HIRE" ||
    !hasTeamPreferences ||
    (selectedTeamId.length > 0 && selectedShiftBand.length > 0);

  const hireDescription = jobTitle
    ? `Select team and shift to hire ${candidateName} on ${jobTitle}.`
    : `Select team and shift to hire ${candidateName}.`;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="gap-3 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedAction
              ? selectedAction === "HIRE"
                ? `Hire ${candidateName}`
                : `${actionLabel} ${candidateName}`
              : `Actions for ${candidateName}`}
          </DialogTitle>
          <DialogDescription>
            {selectedAction
              ? selectedAction === "HIRE"
                ? hireDescription
                : getApplicationStatusActionDescription(selectedAction, candidateName)
              : "Choose how you want to update this application."}
          </DialogDescription>
        </DialogHeader>

        {!selectedAction ? (
          <div className="flex flex-col gap-2">
            {availableActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  setSubmitError(null);
                  setSelectedAction(action);
                }}
                className={getApplicationStatusActionClassName(action)}
              >
                {getApplicationStatusActionLabel(action)}
              </button>
            ))}
          </div>
        ) : selectedAction === "HIRE" ? (
          hasTeamPreferences ? (
            <HirePlacementForm
              teamPreferences={teamPreferences}
              selectedTeamId={selectedTeamId}
              selectedShiftBand={selectedShiftBand}
              onTeamChange={handleTeamChange}
              onShiftChange={setSelectedShiftBand}
            />
          ) : (
            <p className="text-sm text-gray-500">
              No team preferences on this application. Hire will be sent without placement.
            </p>
          )
        ) : null}

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {selectedAction ? (
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                setSelectedAction(null);
              }}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          {selectedAction ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !canSubmitHire}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                selectedAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#F4781B] hover:bg-[#e06a10]"
              }`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {selectedAction === "HIRE" ? "Hire" : actionLabel}
            </button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
