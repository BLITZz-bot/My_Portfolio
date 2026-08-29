/**
 * Input sanitization and validation utilities for server actions
 */

// Strip HTML tags and dangerous characters to protect against XSS
export function sanitizeString(input: string | undefined | null, maxLength = 2000): string {
  if (!input) return "";
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  return cleaned.slice(0, maxLength);
}

// Validate standard email format safely
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  if (trimmed.length > 150) return false;
  // RFC 5322 standard email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

// Validate URLs strictly to prevent javascript: or data: injection
export function isValidSafeUrl(url: string | undefined | null, allowEmpty = true): boolean {
  if (!url || url.trim() === "") return allowEmpty;
  const trimmed = url.trim();
  // Safe protocols only: http, https, mailto, relative paths, or fragment identifiers
  return /^(https?:\/\/|\/|#|mailto:)/i.test(trimmed) && !/^(javascript:|data:|vbscript:)/i.test(trimmed);
}

// Clean and sanitize string arrays (e.g., technologies, skills)
export function sanitizeStringArray(arr: string[] | undefined | null, maxItemLength = 100): string[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr
    .map((item) => sanitizeString(item, maxItemLength))
    .filter((item) => item.length > 0);
}
