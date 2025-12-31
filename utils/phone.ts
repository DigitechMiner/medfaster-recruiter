// utils/phone.ts - REQUIRED for E.164
export function formatPhoneToE164(phone: string, countryCode: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Canada: +1XXXXXXXXXX
  if (countryCode === '1' || countryCode === '+1') {
    if (digitsOnly.length === 10 && /^[2-9]\d{9}$/.test(digitsOnly)) {
      return `+1${digitsOnly}`;
    }
  }
  
  // India: +91XXXXXXXXXX  
  if (countryCode === '91' || countryCode === '+91') {
    if (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly)) {
      return `+91${digitsOnly}`;
    }
  }
  
  return phone; // Fallback
}

export function normalizeDialCode(dialCode?: string): string {
  return dialCode?.replace(/[^\d]/g, '') || '1';
}
