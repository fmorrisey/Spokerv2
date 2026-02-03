// Production environment configuration
// In production, nginx proxies all /api requests to the backend
// So we use a relative path to benefit from same-origin policy
const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Check if API_URL is injected at runtime (e.g., from Docker env or k8s)
  const runtimeApiUrl = (window as any).__env?.API_URL;
  if (runtimeApiUrl) {
    return runtimeApiUrl;
  }
  
  // Default to relative path - nginx will proxy /api/* to backend
  // This works for same-origin deployments
  return '';
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  apiVersion: 'v1',
  features: {
    enableAnalytics: true,
    enableDebugMode: false
  }
};
