// Development runtime environment configuration
// This file is used in development mode
// In production, this is generated from env.template.js by docker-entrypoint.sh
(function(window) {
  window.__env = window.__env || {};
  
  // In development, these are typically not used
  // The environment.ts file handles configuration
  window.__env.API_URL = '';
  window.__env.ENABLE_ANALYTICS = 'false';
  window.__env.ENABLE_DEBUG = 'true';
}(this));
