/**
 * Currency formatter for Australian dollars
 */
export function formatCurrency(amount, options = {}) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(amount);
}

/**
 * Format numbers with thousands separator
 */
export function formatNumber(number, options = {}) {
  return new Intl.NumberFormat("en-AU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(number);
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format weight in kg
 */
export function formatWeight(kg) {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes`;
  }
  return `${kg.toFixed(2)} kg`;
}

/**
 * Format dimensions
 */
export function formatDimensions(length, width, height, unit = "mm") {
  return `${length}×${width}×${height} ${unit}`;
}

/**
 * Format phone number for Australian format
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format Australian postcode
 */
export function formatPostcode(postcode) {
  const cleaned = postcode.replace(/\D/g, "");
  return cleaned.length === 4 ? cleaned : postcode;
}

/**
 * Format date in Australian format
 */
export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options
  }).format(new Date(date));
}

/**
 * Format date and time
 */
export function formatDateTime(date, options = {}) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options
  }).format(new Date(date));
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return formatDate(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Slugify text for URLs
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}