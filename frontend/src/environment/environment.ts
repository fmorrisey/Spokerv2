// Development environment configuration
// Supports both localhost and network access (e.g., from iPad)
import { getFeatureFlag, getRuntimeApiUrl } from './env-utils';

const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5001';
  }

  // Check if API_URL is injected at runtime (e.g., from Docker env)
  const runtimeApiUrl = getRuntimeApiUrl();
  if (runtimeApiUrl !== null) {
    return runtimeApiUrl;
  }

  // For development, construct URL based on current host
  // Match the current page protocol to support HTTPS tunneling (ngrok, Cloudflare Tunnel)
  // This allows access from both localhost and network devices (e.g., iPad on Tailscale)
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5001`;
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
