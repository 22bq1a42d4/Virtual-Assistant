/**
 * Logger Middleware for the React URL Shortener
 * Provides structured logging for application events and errors
 */

// Log levels
export const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Log categories
export const LOG_CATEGORIES = {
  URL_CREATION: 'URL_CREATION',
  URL_ACCESS: 'URL_ACCESS',
  VALIDATION: 'VALIDATION',
  STORAGE: 'STORAGE',
  USER_ACTION: 'USER_ACTION',
  SYSTEM: 'SYSTEM'
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Prevent memory issues
    this.enableConsoleOutput = true;
    this.enableStorage = true;
  }

  /**
   * Creates a formatted log entry
   * @param {string} level - Log level
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {Object} - Formatted log entry
   */
  createLogEntry(level, category, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: { ...data },
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Gets or creates a session ID
   * @returns {string} - Session ID
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  /**
   * Adds a log entry
   * @param {string} level - Log level
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  log(level, category, message, data = {}) {
    const logEntry = this.createLogEntry(level, category, message, data);
    
    // Add to memory
    this.logs.push(logEntry);
    
    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    if (this.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }

    // Storage
    if (this.enableStorage) {
      this.saveToStorage(logEntry);
    }

    // Handle errors specially
    if (level === LOG_LEVELS.ERROR) {
      this.handleError(logEntry);
    }
  }

  /**
   * Outputs log to console with appropriate styling
   * @param {Object} logEntry - The log entry
   */
  outputToConsole(logEntry) {
    const { level, category, message, data } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    
    const styles = {
      [LOG_LEVELS.ERROR]: 'color: #ff4444; font-weight: bold;',
      [LOG_LEVELS.WARN]: 'color: #ffaa00; font-weight: bold;',
      [LOG_LEVELS.INFO]: 'color: #4444ff;',
      [LOG_LEVELS.DEBUG]: 'color: #888888;'
    };

    console.log(
      `%c[${timestamp}] ${level} [${category}] ${message}`,
      styles[level] || ''
    );

    if (Object.keys(data).length > 0) {
      console.log('Data:', data);
    }
  }

  /**
   * Saves log entry to localStorage
   * @param {Object} logEntry - The log entry
   */
  saveToStorage(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('urlShortener_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 logs in storage
      const logsToStore = existingLogs.slice(-100);
      localStorage.setItem('urlShortener_logs', JSON.stringify(logsToStore));
    } catch (error) {
      console.error('Failed to save log to storage:', error);
    }
  }

  /**
   * Handles error-level logs with special processing
   * @param {Object} logEntry - The error log entry
   */
  handleError(logEntry) {
    // In a real application, you might send errors to an external service
    // For now, we'll just ensure they're prominently logged
    if (window.navigator.onLine) {
      // Could send to error tracking service here
      console.error('Error logged:', logEntry);
    }
  }

  // Convenience methods for different log levels
  error(category, message, data = {}) {
    this.log(LOG_LEVELS.ERROR, category, message, data);
  }

  warn(category, message, data = {}) {
    this.log(LOG_LEVELS.WARN, category, message, data);
  }

  info(category, message, data = {}) {
    this.log(LOG_LEVELS.INFO, category, message, data);
  }

  debug(category, message, data = {}) {
    this.log(LOG_LEVELS.DEBUG, category, message, data);
  }

  /**
   * Gets all logs
   * @returns {Array} - Array of log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Gets logs by category
   * @param {string} category - Log category
   * @returns {Array} - Filtered log entries
   */
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Gets logs by level
   * @param {string} level - Log level
   * @returns {Array} - Filtered log entries
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clears all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('urlShortener_logs');
  }

  /**
   * Sets configuration options
   * @param {Object} config - Configuration object
   */
  configure(config) {
    if (config.enableConsoleOutput !== undefined) {
      this.enableConsoleOutput = config.enableConsoleOutput;
    }
    if (config.enableStorage !== undefined) {
      this.enableStorage = config.enableStorage;
    }
    if (config.maxLogs !== undefined) {
      this.maxLogs = config.maxLogs;
    }
  }
}

// Create and export singleton instance
const logger = new Logger();

export default logger;

// Export convenience functions
export const logUrlCreation = (shortcode, originalUrl, customShortcode = false) => {
  logger.info(LOG_CATEGORIES.URL_CREATION, 'URL shortened successfully', {
    shortcode,
    originalUrl,
    customShortcode,
    domain: new URL(originalUrl).hostname
  });
};

export const logUrlAccess = (shortcode, originalUrl, success = true) => {
  logger.info(LOG_CATEGORIES.URL_ACCESS, `URL access ${success ? 'successful' : 'failed'}`, {
    shortcode,
    originalUrl,
    success,
    userAgent: navigator.userAgent
  });
};

export const logValidationError = (field, value, error) => {
  logger.warn(LOG_CATEGORIES.VALIDATION, `Validation failed for ${field}`, {
    field,
    value: typeof value === 'string' ? value.substring(0, 100) : value,
    error
  });
};

export const logStorageError = (operation, error) => {
  logger.error(LOG_CATEGORIES.STORAGE, `Storage operation failed: ${operation}`, {
    operation,
    error: error.message,
    stack: error.stack
  });
};

export const logUserAction = (action, details = {}) => {
  logger.info(LOG_CATEGORIES.USER_ACTION, `User action: ${action}`, details);
};