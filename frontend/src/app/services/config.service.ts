import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  apiVersion: string;
  features: {
    enableAnalytics: boolean;
    enableDebugMode?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly config: AppConfig = environment;

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get apiVersion(): string {
    return this.config.apiVersion;
  }

  get production(): boolean {
    return this.config.production;
  }

  get features() {
    return this.config.features;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getConfig(): Readonly<AppConfig> {
    return this.config;
  }

  // Helper method to build full API endpoint URLs
  getApiEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.apiUrl}/api/${this.apiVersion}/${cleanPath}`;
  }
}