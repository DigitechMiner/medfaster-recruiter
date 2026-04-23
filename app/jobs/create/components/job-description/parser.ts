import type { ParsedAIDescription } from "./types";

export function parseAIDescription(raw: string): ParsedAIDescription {
  const result: ParsedAIDescription = {
    summary: "",
    keyResponsibilities: [],
    requiredSkills: [],
    experience: [],
    workingConditions: [],
    whyJoinUs: [],
  };

  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);

  type SectionKey = keyof ParsedAIDescription;
  const headingMap: { pattern: RegExp; key: SectionKey }[] = [
    { pattern: /key\s*responsibilities/i, key: "keyResponsibilities" },
    { pattern: /required\s*skills?/i, key: "requiredSkills" },
    { pattern: /experience/i, key: "experience" },
    { pattern: /working\s*conditions?/i, key: "workingConditions" },
    { pattern: /why\s*join/i, key: "whyJoinUs" },
  ];

  let currentSection: SectionKey = "summary";
  const summaryLines: string[] = [];

  for (const line of lines) {
    const clean = line.replace(/^#{1,4}\s*/, "").replace(/\*\*/g, "").trim();
    const matchedHeading = headingMap.find(({ pattern }) => pattern.test(clean));
    if (matchedHeading) {
      currentSection = matchedHeading.key;
      continue;
    }

    const content = clean.replace(/^[-•*]\s*/, "").trim();
    if (!content) continue;

    if (currentSection === "summary") {
      summaryLines.push(content);
    } else {
      (result[currentSection] as string[]).push(content);
    }
  }

  result.summary = summaryLines.join("\n");
  return result;
}
