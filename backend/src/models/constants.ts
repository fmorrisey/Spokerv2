export class Routes {

    static readonly PRODUCTS = '/products'
    static readonly HEALTH = '/health'
    static readonly AUTH = '/auth'
}

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
export const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
export const PORT = process.env.PORT || 5001
export const API_VERSION = process.env.API_VERSION || 'v1'; // Example API version
export const API_BASE_URL = process.env.API_BASE_URL || `/api/` ; // Base URL for the API`;
export const API_URL = process.env.API_URL || `${API_BASE_URL}${API_VERSION}`; // Full API URL
export const DEFAULT_PAGE_SIZE = 10; // Default page size for pagination
export const MAX_PAGE_SIZE = 100; // Maximum page size for pagination
export const SESSION_TIMEOUT = 3600; // Session timeout in seconds (1 hour)
export const CACHE_TTL = 300; // Cache time-to-live in seconds (5 minutes)

