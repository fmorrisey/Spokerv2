import { Injectable, inject } from '@angular/core';
import createClient, { type Middleware } from 'openapi-fetch';
import { ConfigService } from '../config.service';
import type { ApiPaths } from '../../../swagger';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private config = inject(ConfigService);
  private client = createClient<ApiPaths>({
    baseUrl: this.config.apiUrl
  });

  constructor() {
    this.setupMiddleware();
  }

  /**
   * Get the underlying openapi-fetch client for direct access
   * This is the recommended way to use the API client
   */
  getClient() {
    return this.client;
  }

  /**
   * Setup middleware for auth, logging, error handling
   */
  private setupMiddleware(): void {
    // Auth middleware
    const authMiddleware: Middleware = {
      onRequest: async ({ request }) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        return request;
      },
      onResponse: async ({ response }) => {
        // Handle 401 globally
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          console.warn('Unauthorized - token may be expired');
        }
        return response;
      }
    };

    // Logging middleware (dev only)
    const loggingMiddleware: Middleware = {
      onRequest: async ({ request }) => {
        if (!this.config.production) {
          console.log(`[API] ${request.method} ${request.url}`);
        }
        return request;
      },
      onResponse: async ({ response, request }) => {
        if (!this.config.production) {
          console.log(`[API] ${request.method} ${request.url} -> ${response.status}`);
        }
        return response;
      }
    };

    this.client.use(authMiddleware);
    if (!this.config.production) {
      this.client.use(loggingMiddleware);
    }
  }
}