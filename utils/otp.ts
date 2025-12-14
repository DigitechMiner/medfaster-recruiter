// OTP related constants

// Resend OTP timer duration in seconds (2 minutes)
export const OTP_RESEND_TIMER_SECONDS = 120;

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum digits to detect as phone number
export const PHONE_DETECT_MIN_LENGTH = 5;

// Default country code (USA/Canada)
export const DEFAULT_COUNTRY_CODE = '1';

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
export function detectContactType(value: string): 'email' | 'phone' | null {
  const trimmedValue = value.trim();
  
  // If empty, return null
  if (trimmedValue.length === 0) {
    return null;
  }

  // Check if it contains email indicators (like @) - prioritize email detection
  const hasEmailIndicator = trimmedValue.includes('@') || trimmedValue.includes('.');
  const isEmail = isValidEmail(trimmedValue);
  
  // If it has email indicators or is a valid email, treat as email
  if (hasEmailIndicator || isEmail) {
    return 'email';
  }

  // Check if it's all digits and long enough to be a phone number
  if (isPhoneNumber(trimmedValue)) {
    return 'phone';
  }

  // Default to email mode if it contains non-digit characters
  return 'email';
}