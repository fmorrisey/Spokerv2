import { Injectable, signal } from '@angular/core';
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

  demoMode = signal<boolean>(false);

  get apiUrl(): string { return this.config.apiUrl; }
  get apiVersion(): string { return this.config.apiVersion; }
  get production(): boolean { return this.config.production; }
  get features() { return this.config.features; }
  get<K extends keyof AppConfig>(key: K): AppConfig[K] { return this.config[key]; }
  getConfig(): Readonly<AppConfig> { return this.config; }

  async loadConfig(): Promise<void> {
    try {
      const res = await fetch(`${this.config.apiUrl}/api/v1/config`);
      if (res.ok) {
        const data = await res.json();
        this.demoMode.set(data.demoMode ?? false);
      }
    } catch {
      // Non-fatal — demo mode stays false
    }
  }
}
