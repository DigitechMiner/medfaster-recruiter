import { z } from "zod";

// Schemas
export const orgSchema = z.object({
  organization_photo: z.any().optional(),
  orgName: z.string().min(1, "Organization Name is required"),
  registeredBusinessName: z.string().optional(),
  orgType: z.string().min(1, "Organization Type is required"),
  email: z.string().email({ message: "Invalid email" }),
  contactNumber: z.string().min(1, "Contact Number is required"),
  website: z.string().min(1, "Website is required"),
  businessNumber: z.string().min(1, "Business Number is required"),
  gstNo: z.string().optional(),
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
});

export const complianceSchema = z.object({
  business_registration_certificate: z.any(),           // required at step 3
  operating_license:                 z.any().optional(),
  certificate:                       z.any().optional(),
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
    organization_photo: null,
    orgName: "",
    registeredBusinessName:  "",
    orgType: "",
    email: "",
    contactNumber: "",
    website: "",
    businessNumber: "",
    gstNo: "",
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
  },
  {
  business_registration_certificate: null,
  operating_license:                 null,
  certificate:                       null,
}

];

export const complianceFields = [
  {
    name: "business_registration_certificate",  // ← was "businessRegistration"
    label: "Business Registration Certificate",
    required: true,
  },
  {
    name: "operating_license",                  // ← this one was already correct
    label: "Operating License",
    required: false,
  },
  {
    name: "certificate",                        // ← was "accreditationCertificate" / "provincialLicense" etc.
    label: "Other Certificate",
    required: false,
  },
];
