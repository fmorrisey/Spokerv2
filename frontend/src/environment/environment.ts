// Development environment configuration
// Supports both localhost and network access (e.g., from iPad)

const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5001';
  }

  // Construct URL based on current host
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
    enableAnalytics: false,
    enableDebugMode: true
  }
};
