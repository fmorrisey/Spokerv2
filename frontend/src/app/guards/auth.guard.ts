import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

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
  const router = inject(Router);

  if (auth.isAuthenticated() || localStorage.getItem('auth_token')) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
