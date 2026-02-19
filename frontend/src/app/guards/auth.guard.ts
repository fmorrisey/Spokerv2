import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ConfigService } from '../services/config.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const config = inject(ConfigService);
  const router = inject(Router);

  // Demo mode bypasses authentication entirely
  if (config.demoMode()) return true;

  if (auth.isAuthenticated()) return true;

  const token = localStorage.getItem('auth_token');
  if (token) {
    await auth.loadCurrentUser();
    if (auth.isAuthenticated()) return true;
  }

  router.navigate(['/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const config = inject(ConfigService);
  const router = inject(Router);

  // In demo mode, /login and /register redirect to home
  if (config.demoMode()) {
    router.navigate(['/']);
    return false;
  }

  if (auth.isAuthenticated() || localStorage.getItem('auth_token')) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
