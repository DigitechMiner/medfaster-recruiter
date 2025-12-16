import { z } from "zod";

// Schemas
export const orgSchema = z.object({
  photo: z.any().optional(),
  orgName: z.string().min(1, "Organization Name is required"),
  orgType: z.string().min(1, "Organization Type is required"),
  email: z.string().email({ message: "Invalid email" }),
  contactNumber: z.string().min(1, "Contact Number is required"),
  website: z.string().min(1, "Website is required"),
  businessNumber: z.string().min(1, "Business Number is required"),
  address: z.string().min(1, "Street Address is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
});

export const contactSchema = z.object({
  primaryContact: z.string().min(1, "Primary Contact is required"),
  contactName: z.string().min(1, "Contact Name is required"),
  designation: z.string().min(1, "Designation is required"),
  contactEmail: z.string().email({ message: "Invalid email" }),
  phone: z.string().min(1, "Phone is required"),
});

export const complianceSchema = z.object({
  operatingLicense: z.any().optional(),
  accreditationCertificate: z.any().optional(),
  provincialLicense: z.any().optional(),
  canadaCertificate: z.any().optional(),
});

// Types
export type OrgDetailsType = z.infer<typeof orgSchema>;
export type ContactType = z.infer<typeof contactSchema>;
export type ComplianceType = z.infer<typeof complianceSchema>;

// Constants
export const steps = ["Organization Details", "Contact Information", "Compliance Verification"];
export const schemas = [orgSchema, contactSchema, complianceSchema];

export const allDefaultValues: [OrgDetailsType, ContactType, ComplianceType] = [
  {
    photo: null,
    orgName: "",
    orgType: "",
    email: "",
    contactNumber: "",
    website: "",
    businessNumber: "",
    address: "",
    postalCode: "",
    city: "",
    province: "",
    country: "",
  },
  {
    primaryContact: "",
    contactName: "",
    designation: "",
    contactEmail: "",
    phone: "",
  },
  {
    operatingLicense: null,
    accreditationCertificate: null,
    provincialLicense: null,
    canadaCertificate: null,
  },
];

export const complianceFields = [
  { label: "Operating License", name: "operatingLicense" },
  { label: "Accreditation Certificate", name: "accreditationCertificate" },
  { label: "Provincial Health License", name: "provincialLicense" },
  { label: "Accreditation Canada Certificate", name: "canadaCertificate" },
];
