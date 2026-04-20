/**
 * ArenaMind AI — Security & Validation Utilities
 * Input sanitization, error handling, logging, and secure practices
 */

// ============================================================
// SECURITY: Input Sanitization & Validation
// ============================================================

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate seat number format
 * @param {string} seatNumber - Seat identifier
 * @returns {boolean} - True if valid format
 */
function validateSeatNumber(seatNumber) {
  if (!seatNumber || typeof seatNumber !== 'string') return false;
  const trimmed = seatNumber.trim();
  // Allow alphanumeric, hyphens, uppercase only
  return /^[A-Z0-9\-]{1,20}$/.test(trimmed);
}

/**
 * Validate API key format (basic check)
 * @param {string} apiKey - Google Maps API Key
 * @returns {boolean} - True if potentially valid
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return false;
  // Google API keys are alphanumeric with hyphens/underscores, no spaces
  return /^[A-Za-z0-9_\-]{20,}$/.test(apiKey.trim());
}

/**
 * Sanitize search queries
 * @param {string} query - Search query
 * @returns {string} - Sanitized query
 */
function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  // Remove special characters that could cause issues
  return query.replace(/[<>;"'`]/g, '').trim();
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - HTML-escaped text
 */
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
}

// ============================================================
// ERROR HANDLING & LOGGING
// ============================================================

/**
 * Global error log
 */
const errorLog = [];
const MAX_ERROR_LOG = 50;

/**
 * Log errors with timestamp
 * @param {string} type - Error type (ERROR, WARNING, INFO)
 * @param {string} message - Error message
 * @param {any} details - Additional error details
 */
function logError(type, message, details = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    message,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  errorLog.unshift(logEntry);
  if (errorLog.length > MAX_ERROR_LOG) {
    errorLog.pop();
  }
  
  // Console output
  const consoleStyle = type === 'ERROR' ? 'color: #ff3e60; font-weight: bold;' :
                     type === 'WARNING' ? 'color: #ffcc00; font-weight: bold;' :
                     'color: #00ff9d;';
  console.log(`%c[${type}] ${message}`, consoleStyle, details);
}

/**
 * Get error log
 * @returns {array} - Array of error log entries
 */
function getErrorLog() {
  return [...errorLog];
}

/**
 * Safe API call wrapper
 * @param {function} fn - Async function to execute
 * @param {string} operation - Operation name
 * @returns {Promise} - Wrapped promise with error handling
 */
async function safeApiCall(fn, operation) {
  try {
    return await fn();
  } catch (error) {
    logError('ERROR', `Failed to complete ${operation}`, {
      message: error.message,
      stack: error.stack
    });
    throw new Error(`${operation} failed: ${error.message}`);
  }
}

// ============================================================
// GOOGLE MAPS SECURITY & INTEGRATION
// ============================================================

/**
 * Load Google Maps with security checks
 * @param {string} apiKey - Valid Google Maps API Key
 * @returns {Promise} - Resolves when map is loaded
 */
function loadGoogleMapsSecure(apiKey) {
  return new Promise((resolve, reject) => {
    // Validate API key format first
    if (!validateApiKey(apiKey)) {
      logError('WARNING', 'Invalid API key format provided');
      reject(new Error('Invalid API key format'));
      return;
    }
    
    // Check if already loading
    if (window.googleMapsLoaded) {
      resolve();
      return;
    }
    
    window.googleMapsLoaded = true;
    
    // Sanitize API key (remove spaces/suspicious chars)
    const cleanKey = apiKey.trim();
    
    // Create script with error handling
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(cleanKey)}&callback=initMapSecure&libraries=visualization`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      logError('ERROR', 'Failed to load Google Maps script', { apiKey: 'REDACTED' });
      window.googleMapsLoaded = false;
      reject(new Error('Google Maps script failed to load'));
    };
    
    window.googleMapsLoadTimeout = setTimeout(() => {
      logError('WARNING', 'Google Maps loading timed out after 10 seconds');
      reject(new Error('Google Maps load timeout'));
    }, 10000);
    
    document.head.appendChild(script);
  });
}

/**
 * Secure Google Map initialization (callback)
 */
window.initMapSecure = async function() {
  try {
    clearTimeout(window.googleMapsLoadTimeout);
    const mapElement = document.getElementById('googleMap');
    if (!mapElement) {
      throw new Error('Map container not found');
    }
    
    // Initialize map with safe options
    window.googleMapObj = new google.maps.Map(mapElement, {
      zoom: 16,
      center: { lat: 28.3949, lng: 77.6955 }, // Default coordinates
      mapTypeId: 'satellite',
      gestureHandling: 'cooperative', // Better mobile support
      fullscreenControl: true,
      mapTypeControl: true,
      streetViewControl: false // Privacy
    });
    
    mapElement.style.display = 'block';
    logError('INFO', 'Google Maps initialized successfully');
  } catch (error) {
    logError('ERROR', 'Google Maps initialization failed', error.message);
  }
};

/**
 * Handle Google Maps errors gracefully
 */
window.handleGoogleMapsError = function(error) {
  logError('ERROR', 'Google Maps error occurred', error);
  // Fallback to SVG map automatically happens in renderStadiumMap()
  const mapFallback = document.getElementById('mapFallback');
  if (mapFallback) {
    mapFallback.style.display = 'block';
  }
};

// ============================================================
// LOCAL STORAGE SECURITY
// ============================================================

/**
 * Securely store API key with validation
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} - Success status
 */
function secureSetStorage(key, value) {
  try {
    if (key === 'arenamind_google_key') {
      if (!validateApiKey(value)) {
        logError('WARNING', 'Attempted to store invalid API key');
        return false;
      }
    }
    localStorage.setItem(key, value);
    logError('INFO', `Stored key: ${key}`);
    return true;
  } catch (error) {
    logError('ERROR', 'Local storage write failed', error.message);
    return false;
  }
}

/**
 * Securely retrieve API key from storage
 * @param {string} key - Storage key
 * @returns {string|null} - Stored value or null
 */
function secureGetStorage(key) {
  try {
    const value = localStorage.getItem(key);
    if (key === 'arenamind_google_key' && value && !validateApiKey(value)) {
      logError('WARNING', 'Retrieved invalid API key from storage');
      return null;
    }
    return value;
  } catch (error) {
    logError('ERROR', 'Local storage read failed', error.message);
    return null;
  }
}

// ============================================================
// RATE LIMITING
// ============================================================

const rateLimitMap = {};

/**
 * Check if operation is rate limited
 * @param {string} operation - Operation identifier
 * @param {number} maxPerSecond - Maximum calls per second
 * @returns {boolean} - True if allowed, false if rate limited
 */
function checkRateLimit(operation, maxPerSecond = 5) {
  const now = Date.now();
  const key = `rl_${operation}`;
  
  if (!rateLimitMap[key]) {
    rateLimitMap[key] = [];
  }
  
  // Remove old entries (older than 1 second)
  rateLimitMap[key] = rateLimitMap[key].filter(time => now - time < 1000);
  
  if (rateLimitMap[key].length >= maxPerSecond) {
    logError('WARNING', `Rate limit exceeded for ${operation}`);
    return false;
  }
  
  rateLimitMap[key].push(now);
  return true;
}

// ============================================================
// CONTENT SECURITY
// ============================================================

/**
 * Validate and sanitize HTML content
 * @param {string} html - HTML content
 * @returns {string} - Safe HTML content
 */
function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  let safe = div.innerHTML;
  
  // Allow only basic markdown-style formatting
  safe = safe
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
  
  return safe;
}

// ============================================================
// PERFORMANCE MONITORING
// ============================================================

const performanceMetrics = {};

/**
 * Start performance measurement
 * @param {string} label - Metric label
 */
function startMetric(label) {
  performanceMetrics[label] = performance.now();
}

/**
 * End performance measurement
 * @param {string} label - Metric label
 * @returns {number} - Duration in milliseconds
 */
function endMetric(label) {
  if (!performanceMetrics[label]) return 0;
  const duration = performance.now() - performanceMetrics[label];
  delete performanceMetrics[label];
  
  // Log slow operations
  if (duration > 1000) {
    logError('WARNING', `Slow operation detected: ${label}`, `${duration.toFixed(2)}ms`);
  }
  
  return duration;
}

// ============================================================
// CSRF PROTECTION (Token Generation)
// ============================================================

/**
 * Generate CSRF token
 * @returns {string} - CSRF token
 */
function generateCSRFToken() {
  return Math.random().toString(36).substr(2, 9) +
         Math.random().toString(36).substr(2, 9);
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} - Token validity
 */
function validateCSRFToken(token) {
  return /^[a-z0-9]{18}$/.test(token);
}

// ============================================================
// EXPORT
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeInput,
    validateSeatNumber,
    validateApiKey,
    sanitizeSearchQuery,
    escapeHTML,
    logError,
    getErrorLog,
    safeApiCall,
    loadGoogleMapsSecure,
    secureSetStorage,
    secureGetStorage,
    checkRateLimit,
    sanitizeHTML,
    startMetric,
    endMetric,
    generateCSRFToken,
    validateCSRFToken
  };
}
