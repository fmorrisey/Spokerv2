// Runtime environment configuration
// This file is a template that gets processed by envsubst at container startup.
// The ${VARIABLE} placeholders are replaced with actual environment variable values
// via the docker-entrypoint.sh script, which generates the final env.js file.
(function() {
  var root = typeof window !== 'undefined' ? window :
             typeof globalThis !== 'undefined' ? globalThis : this;
  root.__env = root.__env || {};

  // API configuration
  root.__env.API_URL = '${API_URL}';

  // Feature flags
  root.__env.ENABLE_ANALYTICS = '${ENABLE_ANALYTICS}';
  root.__env.ENABLE_DEBUG = '${ENABLE_DEBUG}';
})();
