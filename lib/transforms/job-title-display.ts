/** Full title from slug: `registered_nurse` → Registered Nurse */
function toLabel(raw: string): string {
  const s = raw.trim();
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Abbreviation from slug: split on `_`, take the first letter of each part, uppercase.
 * e.g. `registered_nurse` → RN, `community_disability_service_worker` → CDSW
 */
function abbrevFromSlug(slug: string): string {
  const parts = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .split("_")
    .filter((p) => p.length > 0);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

/**
 * Single title → full label. Multiple slugs → `RN | LPN | HCA` (initials from each slug).
 */
export function jobTitlesDesignation(slugs: string[]): {
  designation: string;
  job_title_labels: string[];
} {
  const cleaned = slugs.map((s) => String(s ?? "").trim()).filter(Boolean);
  const job_title_labels = cleaned.map((s) => toLabel(s));
  if (cleaned.length === 0) return { designation: "—", job_title_labels: [] };
  if (cleaned.length === 1) {
    return { designation: job_title_labels[0], job_title_labels };
  }
  const designation = cleaned.map(abbrevFromSlug).join(" | ");
  return { designation, job_title_labels };
}
