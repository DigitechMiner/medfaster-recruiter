import { otp, regex } from "@/utils/constant/config";

// Resend OTP timer duration in seconds (2 minutes)
export const OTP_RESEND_TIMER_SECONDS = otp.resend_timer_seconds;

// Email validation regex
export const EMAIL_REGEX = regex.email;

// Minimum digits to detect as phone number
export const PHONE_DETECT_MIN_LENGTH = otp.phone_min_length;

// Default country code (USA/Canada)
export const DEFAULT_COUNTRY_CODE = otp.default_country_code;

/**
 * Validates if a string is a valid email address
 * @param value - The string to validate
 * @returns true if the value is a valid email, false otherwise
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/**
 * Checks if a string is a phone number (all digits and meets minimum length)
 * @param value - The string to check
 * @returns true if the value appears to be a phone number, false otherwise
 */
export function isPhoneNumber(value: string): boolean {
  const trimmedValue = value.trim();
  const isAllDigits = /^\d+$/.test(trimmedValue);
  return isAllDigits && trimmedValue.length > PHONE_DETECT_MIN_LENGTH;
}

/**
 * Detects whether a contact value is an email or phone number
 * Prioritizes email detection if email indicators are present
 * @param value - The contact value to analyze
 * @returns 'email' if detected as email, 'phone' if detected as phone, null if empty
 */
export function detectContactType(
  value: string
): "email" | "phone" | null {
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
