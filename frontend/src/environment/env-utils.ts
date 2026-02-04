// Shared environment utilities
// Used by both development and production environment configs

/**
 * Get a feature flag value from runtime environment
 * @param key - The environment variable key (e.g., 'ENABLE_ANALYTICS')
 * @param defaultValue - Default value if not set
 */
export const getFeatureFlag = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const value = window.__env?.[key as keyof typeof window.__env];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === true;
};

/**
 * Get runtime API URL if injected via window.__env
 * @returns The runtime API URL or null if not set
 */
export const getRuntimeApiUrl = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const runtimeApiUrl = window.__env?.API_URL;
  if (runtimeApiUrl !== undefined && runtimeApiUrl !== null) {
    return runtimeApiUrl;
  }
  return null;
};
