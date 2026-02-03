// Development environment configuration
// Supports both localhost and network access (e.g., from iPad)
const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5001';
  }
  
  // Check if API_URL is injected at runtime (e.g., from Docker env)
  const runtimeApiUrl = (window as any).__env?.API_URL;
  if (runtimeApiUrl) {
    return runtimeApiUrl;
  }
  
  // For development, construct URL based on current host
  // This allows access from both localhost and network devices
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5001`;
};

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
  apiVersion: 'v1',
  features: {
    enableAnalytics: false,
    enableDebugMode: true
  }
};