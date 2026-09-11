/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get random item from array
 */
export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Sort array by key
 */
export function sortBy(array, key, direction = "asc") {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Get unique values from array
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates(array, key) {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested array
 */
export function flatten(array) {
  return array.flat(Infinity);
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === "string") return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
}

/**
 * Merge objects
 */
export function mergeObjects(...objects) {
  return Object.assign({}, ...objects);
}

/**
 * Pick specific keys from object
 */
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Omit specific keys from object
 */
export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Convert object to query string
 */
export function toQueryString(obj) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Local storage helpers
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
  
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
};

/**
 * Session storage helpers
 */
export const session = {
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  },
  
  remove(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from sessionStorage:", error);
    }
  },
  
  clear() {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  }
};