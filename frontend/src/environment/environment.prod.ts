// Production environment configuration
// In production, nginx proxies all /api requests to the backend
// So we use a relative path to benefit from same-origin policy

export const environment = {
  production: true,
  apiUrl: '', // Empty = relative path, nginx proxies /api/* to backend
  apiVersion: 'v1',
  features: {
    enableAnalytics: true,
    enableDebugMode: false
  }
};
