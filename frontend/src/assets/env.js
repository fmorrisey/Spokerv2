// Development runtime environment configuration
// This file is used in development mode
// In production, this is generated from env.template.js by docker-entrypoint.sh
(function() {
  var root = typeof window !== 'undefined' ? window :
             typeof globalThis !== 'undefined' ? globalThis : this;
  root.__env = root.__env || {};

  // In development, these are typically not used
  // The environment.ts file handles configuration
  root.__env.API_URL = '';
  root.__env.ENABLE_ANALYTICS = 'false';
  root.__env.ENABLE_DEBUG = 'true';
})();
