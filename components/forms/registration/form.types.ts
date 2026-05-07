import { z } from "zod";

import type {
  allDefaultValues,
  complianceSchema,
  contactSchema,
  orgSchema,
} from "./form-config";

export type OrgDetailsType = z.infer<typeof orgSchema>;
export type ContactType = z.infer<typeof contactSchema>;
export type ComplianceType = z.infer<typeof complianceSchema>;
export type RegistrationFormValues = (typeof allDefaultValues)[number];
