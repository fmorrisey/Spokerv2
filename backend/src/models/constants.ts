export class Routes {

    static readonly PRODUCTS = '/products'
    static readonly HEALTH = '/health'
    static readonly AUTH = '/auth'
    static readonly CONFIG = '/config'
}

function getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but was not provided.`);
    }
    return value;
}

export const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
export const JWT_REFRESH_SECRET = getRequiredEnvVar('JWT_REFRESH_SECRET');
export const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
export const PORT = process.env.PORT || 5001
export const API_VERSION = process.env.API_VERSION || 'v1'; // Example API version
export const API_BASE_URL = process.env.API_BASE_URL || `/api/` ; // Base URL for the API`;
export const API_URL = process.env.API_URL || `${API_BASE_URL}${API_VERSION}`; // Full API URL
export const DEFAULT_PAGE_SIZE = 10; // Default page size for pagination
export const MAX_PAGE_SIZE = 100; // Maximum page size for pagination
export const SESSION_TIMEOUT = 3600; // Session timeout in seconds (1 hour)
export const CACHE_TTL = 300; // Cache time-to-live in seconds (5 minutes)
export const DEMO_MODE = process.env.DEMO_MODE === 'true';

