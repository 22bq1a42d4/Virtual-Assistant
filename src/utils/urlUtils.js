/**
 * URL Utilities for the React URL Shortener
 * Handles URL validation, shortcode generation, and URL processing
 */

// URL validation regex pattern
const URL_PATTERN = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validates if a given string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Add protocol if missing
  const urlToTest = url.startsWith('http') ? url : `https://${url}`;
  
  try {
    new URL(urlToTest);
    return URL_PATTERN.test(urlToTest);
  } catch {
    return false;
  }
};

/**
 * Generates a random shortcode
 * @param {number} length - Length of the shortcode (default: 6)
 * @returns {string} - Generated shortcode
 */
export const generateShortcode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validates a custom shortcode
 * @param {string} shortcode - The shortcode to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidShortcode = (shortcode) => {
  if (!shortcode || typeof shortcode !== 'string') return false;
  
  // Shortcode should be 3-20 characters, alphanumeric only
  const shortcodePattern = /^[a-zA-Z0-9]{3,20}$/;
  return shortcodePattern.test(shortcode);
};

/**
 * Normalizes a URL by adding protocol if missing
 * @param {string} url - The URL to normalize
 * @returns {string} - Normalized URL
 */
export const normalizeURL = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
};

/**
 * Validates validity period input
 * @param {string|number} period - Period in hours
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidPeriod = (period) => {
  if (!period) return true; // Optional field
  const num = Number(period);
  return !isNaN(num) && num > 0 && num <= 8760; // Max 1 year
};

/**
 * Calculates expiry date based on validity period
 * @param {number} hours - Hours until expiry
 * @returns {Date} - Expiry date
 */
export const calculateExpiryDate = (hours) => {
  if (!hours) return null;
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

/**
 * Checks if a URL has expired
 * @param {Date|string} expiryDate - The expiry date
 * @returns {boolean} - True if expired, false otherwise
 */
export const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
};

/**
 * Formats a date for display
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'No expiry';
  return new Date(date).toLocaleString();
};

/**
 * Generates the full short URL
 * @param {string} shortcode - The shortcode
 * @returns {string} - Full short URL
 */
export const generateShortURL = (shortcode) => {
  return `${window.location.origin}/${shortcode}`;
};