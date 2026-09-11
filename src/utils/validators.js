/**
 * Email validation
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Australian phone number validation
 */
export function isValidAustralianPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  
  // Australian mobile: 04xxxxxxxx or 05xxxxxxxx
  const mobileRegex = /^0[45]\d{8}$/;
  // Australian landline: 02xxxxxxxx, 03xxxxxxxx, 07xxxxxxxx, 08xxxxxxxx
  const landlineRegex = /^0[2378]\d{8}$/;
  
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
}

/**
 * Australian postcode validation
 */
export function isValidAustralianPostcode(postcode) {
  const cleaned = postcode.replace(/\D/g, "");
  const postcodeRegex = /^[0-8]\d{3}$/;
  return postcodeRegex.test(cleaned);
}

/**
 * VIN validation (simplified)
 */
export function isValidVIN(vin) {
  const cleaned = vin.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  // VIN must be exactly 17 characters
  if (cleaned.length !== 17) return false;
  
  // VIN cannot contain I, O, Q
  if (/[IOQ]/.test(cleaned)) return false;
  
  return true;
}

/**
 * ABN validation (Australian Business Number)
 */
export function isValidABN(abn) {
  const cleaned = abn.replace(/\D/g, "");
  
  if (cleaned.length !== 11) return false;
  
  // ABN validation algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;
  
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(cleaned[i]);
    if (i === 0) digit -= 1;
    sum += (digit * weights[i]) % 89;
  }
  
  return sum % 89 === 0;
}

/**
 * Password strength validation
 */
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? "strong" : errors.length <= 2 ? "medium" : "weak"
  };
}

/**
 * URL validation
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Required field validation
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Minimum length validation
 */
export function minLength(value, min) {
  if (typeof value !== "string") return false;
  return value.length >= min;
}

/**
 * Maximum length validation
 */
export function maxLength(value, max) {
  if (typeof value !== "string") return false;
  return value.length <= max;
}

/**
 * Range validation
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Positive number validation
 */
export function isPositive(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Integer validation
 */
export function isInteger(value) {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num);
}