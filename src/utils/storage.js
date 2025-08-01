/**
 * Storage utilities for the React URL Shortener
 * Handles localStorage operations for URL mappings and statistics
 */

import { generateShortcode, isExpired } from './urlUtils';

// Storage keys
const STORAGE_KEYS = {
  URL_MAPPINGS: 'urlShortener_mappings',
  STATISTICS: 'urlShortener_statistics'
};

/**
 * URL mapping structure:
 * {
 *   shortcode: string,
 *   originalUrl: string,
 *   createdAt: Date,
 *   expiryDate: Date|null,
 *   clickCount: number
 * }
 */

/**
 * Gets all URL mappings from localStorage
 * @returns {Array} - Array of URL mapping objects
 */
export const getAllMappings = () => {
  try {
    const mappings = localStorage.getItem(STORAGE_KEYS.URL_MAPPINGS);
    return mappings ? JSON.parse(mappings) : [];
  } catch (error) {
    console.error('Error reading mappings from localStorage:', error);
    return [];
  }
};

/**
 * Saves URL mappings to localStorage
 * @param {Array} mappings - Array of URL mapping objects
 */
export const saveMappings = (mappings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.URL_MAPPINGS, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error saving mappings to localStorage:', error);
    throw new Error('Failed to save URL mappings. Storage might be full.');
  }
};

/**
 * Gets a specific mapping by shortcode
 * @param {string} shortcode - The shortcode to look up
 * @returns {Object|null} - The mapping object or null if not found
 */
export const getMapping = (shortcode) => {
  const mappings = getAllMappings();
  return mappings.find(mapping => mapping.shortcode === shortcode) || null;
};

/**
 * Creates a new URL mapping
 * @param {string} originalUrl - The original URL
 * @param {string} customShortcode - Optional custom shortcode
 * @param {Date} expiryDate - Optional expiry date
 * @returns {Object} - The created mapping object
 */
export const createMapping = (originalUrl, customShortcode = null, expiryDate = null) => {
  const mappings = getAllMappings();
  
  // Generate or validate shortcode
  let shortcode = customShortcode;
  if (!shortcode) {
    // Generate unique shortcode
    do {
      shortcode = generateShortcode();
    } while (mappings.some(mapping => mapping.shortcode === shortcode));
  } else {
    // Check if custom shortcode already exists
    if (mappings.some(mapping => mapping.shortcode === shortcode)) {
      throw new Error(`Shortcode "${shortcode}" is already in use. Please choose a different one.`);
    }
  }

  // Create new mapping
  const newMapping = {
    shortcode,
    originalUrl,
    createdAt: new Date().toISOString(),
    expiryDate: expiryDate ? expiryDate.toISOString() : null,
    clickCount: 0
  };

  // Save to storage
  const updatedMappings = [...mappings, newMapping];
  saveMappings(updatedMappings);

  return newMapping;
};

/**
 * Creates multiple URL mappings
 * @param {Array} urlData - Array of {url, shortcode, expiryDate} objects
 * @returns {Array} - Array of created mapping objects
 */
export const createMultipleMappings = (urlData) => {
  const results = [];
  const errors = [];

  urlData.forEach((data, index) => {
    try {
      const mapping = createMapping(data.url, data.shortcode, data.expiryDate);
      results.push(mapping);
    } catch (error) {
      errors.push({ index, url: data.url, error: error.message });
    }
  });

  return { results, errors };
};

/**
 * Increments click count for a shortcode
 * @param {string} shortcode - The shortcode to increment
 * @returns {boolean} - True if successful, false otherwise
 */
export const incrementClickCount = (shortcode) => {
  try {
    const mappings = getAllMappings();
    const mappingIndex = mappings.findIndex(mapping => mapping.shortcode === shortcode);
    
    if (mappingIndex === -1) return false;

    // Check if expired
    if (isExpired(mappings[mappingIndex].expiryDate)) {
      return false;
    }

    mappings[mappingIndex].clickCount += 1;
    saveMappings(mappings);
    return true;
  } catch (error) {
    console.error('Error incrementing click count:', error);
    return false;
  }
};

/**
 * Gets statistics for all URLs
 * @returns {Object} - Statistics object
 */
export const getStatistics = () => {
  const mappings = getAllMappings();
  
  const stats = {
    totalUrls: mappings.length,
    totalClicks: mappings.reduce((sum, mapping) => sum + mapping.clickCount, 0),
    activeUrls: mappings.filter(mapping => !isExpired(mapping.expiryDate)).length,
    expiredUrls: mappings.filter(mapping => isExpired(mapping.expiryDate)).length
  };

  return stats;
};

/**
 * Cleans up expired URLs
 * @returns {number} - Number of expired URLs removed
 */
export const cleanupExpiredUrls = () => {
  const mappings = getAllMappings();
  const activeMappings = mappings.filter(mapping => !isExpired(mapping.expiryDate));
  const removedCount = mappings.length - activeMappings.length;
  
  if (removedCount > 0) {
    saveMappings(activeMappings);
  }
  
  return removedCount;
};

/**
 * Deletes a specific mapping
 * @param {string} shortcode - The shortcode to delete
 * @returns {boolean} - True if deleted, false if not found
 */
export const deleteMapping = (shortcode) => {
  try {
    const mappings = getAllMappings();
    const filteredMappings = mappings.filter(mapping => mapping.shortcode !== shortcode);
    
    if (filteredMappings.length === mappings.length) {
      return false; // Not found
    }
    
    saveMappings(filteredMappings);
    return true;
  } catch (error) {
    console.error('Error deleting mapping:', error);
    return false;
  }
};

/**
 * Clears all data
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.URL_MAPPINGS);
    localStorage.removeItem(STORAGE_KEYS.STATISTICS);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};