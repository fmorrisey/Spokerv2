// Production environment configuration
// In production, nginx proxies all /api requests to the backend
// So we use a relative path to benefit from same-origin policy
const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Check if API_URL is injected at runtime (e.g., from Docker env or k8s)
  // Empty string is a valid value (for relative paths), so check for undefined/null specifically
  const runtimeApiUrl = (window as any).__env?.API_URL;
  if (runtimeApiUrl !== undefined && runtimeApiUrl !== null) {
    return runtimeApiUrl;
  }
  
  // Default to relative path - nginx will proxy /api/* to backend
  // This works for same-origin deployments
  return '';
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
  production: true,
  apiUrl: getApiUrl(),
  apiVersion: 'v1',
  features: {
    enableAnalytics: getFeatureFlag('ENABLE_ANALYTICS', true),
    enableDebugMode: getFeatureFlag('ENABLE_DEBUG', false)
  }
};
