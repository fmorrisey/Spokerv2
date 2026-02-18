import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiClientService } from '../apiClient/api-client.service';
import { components } from '../../../swagger/auth';

type User = components['schemas']['User'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiClient = inject(ApiClientService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    const token = localStorage.getItem('auth_token');
    if (token) this.loadCurrentUser();
  }

  async login(email: string, password: string): Promise<void> {
    const client = this.apiClient.getClient();
    const { data, error } = await client.POST('/api/v1/auth/login', {
      body: { email, password }
    });
    if (error || !data) throw error ?? new Error('Login failed');
    localStorage.setItem('auth_token', data.accessToken);
    this.currentUser.set(data.user);
    this.isAuthenticated.set(true);
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const client = this.apiClient.getClient();
    const { data, error } = await client.POST('/api/v1/auth/register', {
      body: { email, password, name }
    });
    if (error || !data) throw error ?? new Error('Registration failed');
    localStorage.setItem('auth_token', data.accessToken);
    this.currentUser.set(data.user);
    this.isAuthenticated.set(true);
  }

  async logout(): Promise<void> {
    try {
      const client = this.apiClient.getClient();
      await client.POST('/api/v1/auth/logout', {});
    } catch (err) {
      console.warn('Logout API call failed, clearing local session anyway', err);
    } finally {
      localStorage.removeItem('auth_token');
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    }
  }

  async loadCurrentUser(): Promise<void> {
    try {
      const client = this.apiClient.getClient();
      const { data } = await client.GET('/api/v1/auth/me');
      if (data) {
        this.currentUser.set(data);
        this.isAuthenticated.set(true);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      console.warn('Failed to load current user', err);
      localStorage.removeItem('auth_token');
    }
  }
}
