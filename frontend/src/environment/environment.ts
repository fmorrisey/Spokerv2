// Development environment configuration
// Supports both localhost and network access (e.g., from iPad)
const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5001';
  }
  
  // Check if API_URL is injected at runtime (e.g., from Docker env)
  // Empty string is a valid value (for relative paths), so check for undefined/null specifically
  const runtimeApiUrl = (window as any).__env?.API_URL;
  if (runtimeApiUrl !== undefined && runtimeApiUrl !== null) {
    return runtimeApiUrl;
  }
  
  // For development, construct URL based on current host
  // Always use HTTP since backend runs on HTTP in development
  // This allows access from both localhost and network devices (e.g., iPad on Tailscale)
  const hostname = window.location.hostname;
  return `http://${hostname}:5001`;
};

const getFeatureFlag = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const value = (window as any).__env?.[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === true;
};

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
  apiVersion: 'v1',
  features: {
    enableAnalytics: getFeatureFlag('ENABLE_ANALYTICS', false),
    enableDebugMode: getFeatureFlag('ENABLE_DEBUG', true)
  }
};