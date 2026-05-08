const AUTH_CONFIG = {
  otp: {
    resendTimerSeconds: 60,
    phoneMinLength: 5,
  },
  regex: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const OTP_RESEND_TIMER_SECONDS = AUTH_CONFIG.otp.resendTimerSeconds;

const EMAIL_REGEX = AUTH_CONFIG.regex.email;
const PHONE_DETECT_MIN_LENGTH = AUTH_CONFIG.otp.phoneMinLength;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
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
