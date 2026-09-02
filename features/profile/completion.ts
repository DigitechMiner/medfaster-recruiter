import type { RecruiterDocument, RecruiterProfile } from "./types";

export const PROFILE_COMPLETE_PERCENT = 100;

export type ProfileTab = "contact" | "organization" | "documents" | "security";

export type IncompleteProfileItem = {
  label: string;
  tab: ProfileTab;
};

export type JobCreateBlockKind =
  | "incomplete"
  | "under_review"
  | "rejected"
  | "suspended";

export type JobCreateBlock = {
  kind: JobCreateBlockKind;
  title: string;
  description: string;
  items: string[];
  href: string;
  actionLabel: string;
  percentage: number;
};

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim();
}

function normalizeStatus(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isPendingStatus(status: string): boolean {
  return status === "pending";
}

function isRejectedStatus(status: string): boolean {
  return status === "rejected";
}

function isSuspendedStatus(status: string): boolean {
  return status === "suspended";
}

function hasDocumentsWithStatus(
  documents: RecruiterDocument[] | null | undefined,
  match: (status: string) => boolean,
): boolean {
  return (documents ?? []).some((doc) => match(normalizeStatus(doc.status)));
}

export function isProfileCompleteForJobs(
  profile: RecruiterProfile | null | undefined,
): boolean {
  return (profile?.completion_percentage ?? 0) >= PROFILE_COMPLETE_PERCENT;
}

export function getIncompleteProfileItems(
  profile: RecruiterProfile | null | undefined,
  documents?: RecruiterDocument[] | null,
): IncompleteProfileItem[] {
  if (!profile) {
    return [{ label: "Organization details", tab: "organization" }];
  }

  const missing: IncompleteProfileItem[] = [];

  if (isBlank(profile.organization_photo_url)) {
    missing.push({ label: "Organization logo", tab: "organization" });
  }
  if (isBlank(profile.organization_name)) {
    missing.push({ label: "Organization name", tab: "organization" });
  }
  if (isBlank(profile.registered_business_name)) {
    missing.push({ label: "Registered business name", tab: "organization" });
  }
  if (isBlank(profile.organization_type)) {
    missing.push({ label: "Organization type", tab: "organization" });
  }
  if (isBlank(profile.official_email_address)) {
    missing.push({ label: "Official email address", tab: "organization" });
  }
  if (isBlank(profile.contact_number)) {
    missing.push({ label: "Contact number", tab: "organization" });
  }
  if (isBlank(profile.organization_website)) {
    missing.push({ label: "Organization website", tab: "organization" });
  }
  if (isBlank(profile.street_address)) {
    missing.push({ label: "Street address", tab: "organization" });
  }
  if (isBlank(profile.postal_code)) {
    missing.push({ label: "Postal code", tab: "organization" });
  }
  if (isBlank(profile.province)) {
    missing.push({ label: "Province", tab: "organization" });
  }
  if (isBlank(profile.city)) {
    missing.push({ label: "City", tab: "organization" });
  }
  if (isBlank(profile.country)) {
    missing.push({ label: "Country", tab: "organization" });
  }
  if (isBlank(profile.canadian_business_number)) {
    missing.push({ label: "Canadian business number", tab: "organization" });
  }
  if (isBlank(profile.gst_no)) {
    missing.push({ label: "GST number", tab: "organization" });
  }
  if (isBlank(profile.contact_person_name)) {
    missing.push({ label: "Contact person name", tab: "contact" });
  }
  if (isBlank(profile.contact_person_designation)) {
    missing.push({ label: "Designation", tab: "contact" });
  }
  if (isBlank(profile.contact_person_email)) {
    missing.push({ label: "Contact email", tab: "contact" });
  }
  if (isBlank(profile.contact_person_phone)) {
    missing.push({ label: "Contact phone", tab: "contact" });
  }
  if (documents && documents.length === 0) {
    missing.push({
      label: "Business registration certificate",
      tab: "documents",
    });
  }

  if (missing.length === 0 && !isProfileCompleteForJobs(profile)) {
    missing.push({ label: "Remaining profile details", tab: "organization" });
  }

  return missing;
}

export function getCompleteProfileHref(
  missing: IncompleteProfileItem[] = [],
): string {
  const tab = missing[0]?.tab ?? "organization";
  return `/profile?tab=${tab}`;
}

export function getJobCreateBlock(
  profile: RecruiterProfile | null | undefined,
  documents?: RecruiterDocument[] | null,
): JobCreateBlock | null {
  const percentage = profile?.completion_percentage ?? 0;
  const missing = getIncompleteProfileItems(profile, documents);
  const profileStatus = normalizeStatus(profile?.status);
  const documentsPending = hasDocumentsWithStatus(documents, isPendingStatus);
  const documentsRejected = hasDocumentsWithStatus(documents, isRejectedStatus);

  if (missing.length > 0 || !isProfileCompleteForJobs(profile)) {
    return {
      kind: "incomplete",
      title: "Complete your profile",
      description: `Your profile is ${percentage}% complete. Finish it to 100% before you can post a job.`,
      items: missing.map((item) => item.label),
      href: getCompleteProfileHref(missing),
      actionLabel: "Complete profile",
      percentage,
    };
  }

  if (isRejectedStatus(profileStatus) || documentsRejected) {
    const items: string[] = [];
    if (isRejectedStatus(profileStatus)) {
      items.push("Profile verification was rejected");
    }
    if (documentsRejected) {
      items.push("A compliance document was rejected");
    }
    return {
      kind: "rejected",
      title: "Verification unsuccessful",
      description:
        "Update your profile or documents before you can post a job.",
      items,
      href: documentsRejected ? "/profile?tab=documents" : "/profile",
      actionLabel: "View profile",
      percentage,
    };
  }

  if (isSuspendedStatus(profileStatus)) {
    return {
      kind: "suspended",
      title: "Account suspended",
      description: "Your account is suspended, so you can't post jobs right now.",
      items: ["Account suspended"],
      href: "/profile",
      actionLabel: "View profile",
      percentage,
    };
  }

  const profilePending = isPendingStatus(profileStatus);
  if (profilePending || documentsPending) {
    const items: string[] = [];
    if (profilePending) items.push("Profile under review");
    if (documentsPending) items.push("Document under review");

    const description =
      profilePending && documentsPending
        ? "Your profile and documents are being reviewed. You can post jobs once they're approved."
        : profilePending
          ? "Your profile is being reviewed. You can post jobs once it's approved."
          : "Your documents are being reviewed. You can post jobs once they're approved.";

    return {
      kind: "under_review",
      title: "Account under review",
      description,
      items,
      href: documentsPending ? "/profile?tab=documents" : "/profile",
      actionLabel: "View profile",
      percentage,
    };
  }

  return null;
}

export function canCreateJobs(
  profile: RecruiterProfile | null | undefined,
  documents?: RecruiterDocument[] | null,
): boolean {
  return getJobCreateBlock(profile, documents) === null;
}

export function isIncompleteProfileError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("complete your profile") ||
    (lower.includes("profile") && lower.includes("100%")) ||
    lower.includes("under review") ||
    lower.includes("pending verification") ||
    lower.includes("profile is pending") ||
    lower.includes("not verified") ||
    lower.includes("awaiting verification") ||
    (lower.includes("document") && lower.includes("pending"))
  );
}
