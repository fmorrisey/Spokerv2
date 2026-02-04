// Runtime environment configuration
// This file is a template that gets processed by envsubst at container startup.
// The ${VARIABLE} placeholders are replaced with actual environment variable values
// via the docker-entrypoint.sh script, which generates the final env.js file.
(function(window) {
  window.__env = window.__env || {};
  
  // API configuration
  window.__env.API_URL = '${API_URL}';
  
  // Feature flags
  window.__env.ENABLE_ANALYTICS = '${ENABLE_ANALYTICS}';
  window.__env.ENABLE_DEBUG = '${ENABLE_DEBUG}';
}(this));
