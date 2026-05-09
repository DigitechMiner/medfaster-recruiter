const AUTH_CONFIG = {
  otp: {
    /** OTP digit count for recruiter login and credential verification UI. */
    length: 4,
    resendTimerSeconds: 60,
    phoneMinLength: 5,
  },
  /** Default E.164 dial prefix shown for recruiter phone OTP (sign-in & UI defaults). */
  defaultPhoneDialCode: "+1",
  regex: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    /** Recruiter login / credential phone stored as full E.164 (e.g. +14165550123). */
    loginPhoneE164: /^\+[1-9]\d{6,14}$/,
  },
} as const;

/** String widened so UI state can hold any selected dial code, not only the default literal. */
export const DEFAULT_PHONE_DIAL_CODE: string = AUTH_CONFIG.defaultPhoneDialCode;

export const OTP_LENGTH = AUTH_CONFIG.otp.length;
export const OTP_RESEND_TIMER_SECONDS = AUTH_CONFIG.otp.resendTimerSeconds;

/** Empty OTP digit slots for inputs (length follows `OTP_LENGTH`). */
export function emptyOtpDigits(): string[] {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

const EMAIL_REGEX = AUTH_CONFIG.regex.email;
const LOGIN_PHONE_E164_REGEX = AUTH_CONFIG.regex.loginPhoneE164;
const PHONE_DETECT_MIN_LENGTH = AUTH_CONFIG.otp.phoneMinLength;

/** Recruiter login email rule (same pattern as sign-in contact detection). */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/** Non-empty login phone in E.164 form (recruiter credential / OTP payloads). */
export function isRecruiterLoginPhoneE164(value: string): boolean {
  return LOGIN_PHONE_E164_REGEX.test(value.trim());
}

/** Empty or valid login email for editable credential fields. */
export function isOptionalCredentialEmail(value: string): boolean {
  return value.trim() === "" || isValidEmail(value);
}

/** Empty or valid E.164 login phone for editable credential fields. */
export function isOptionalCredentialPhone(value: string): boolean {
  return value.trim() === "" || isRecruiterLoginPhoneE164(value);
}

/**
 * Split E.164 into `phone` + `country_code` for OTP APIs (matches login send/verify payload shape).
 */
export function buildVerifyCredentialPhonePayload(e164: string): {
  phone: string;
  country_code: string;
} {
  const trimmed = e164.trim();
  const m = trimmed.match(/^\+(\d{1,3})(\d{4,14})$/);
  if (!m) return { phone: trimmed, country_code: "1" };
  return { phone: trimmed, country_code: m[1] };
}

function isPhoneNumber(value: string): boolean {
  const trimmedValue = value.trim();
  const isAllDigits = /^\d+$/.test(trimmedValue);
  return isAllDigits && trimmedValue.length > PHONE_DETECT_MIN_LENGTH;
}

export function detectContactType(value: string): "email" | "phone" | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const hasEmailIndicator =
    trimmedValue.includes("@") || trimmedValue.includes(".");
  const isEmail = isValidEmail(trimmedValue);

  if (hasEmailIndicator || isEmail) {
    return "email";
  }

  if (isPhoneNumber(trimmedValue)) {
    return "phone";
  }

  return "email";
}

export function formatPhoneToE164(phone: string, countryCode: string): string {
  const digitsOnly = phone.replace(/\D/g, "");

  if (countryCode === "1" || countryCode === "+1") {
    if (digitsOnly.length === 10 && /^[2-9]\d{9}$/.test(digitsOnly)) {
      return `+1${digitsOnly}`;
    }
  }

  if (countryCode === "91" || countryCode === "+91") {
    if (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly)) {
      return `+91${digitsOnly}`;
    }
  }

  return phone;
}
