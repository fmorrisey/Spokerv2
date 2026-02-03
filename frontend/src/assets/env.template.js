// Runtime environment configuration
// This file can be replaced at container startup with actual values
(function(window) {
  window.__env = window.__env || {};
  
  // API configuration
  window.__env.API_URL = '${API_URL}';
  
  // Feature flags
  window.__env.ENABLE_ANALYTICS = '${ENABLE_ANALYTICS}';
  window.__env.ENABLE_DEBUG = '${ENABLE_DEBUG}';
}(this));
