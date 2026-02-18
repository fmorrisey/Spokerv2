import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  // Check localStorage directly for page-reload case (signal not yet populated)
  if (localStorage.getItem('auth_token')) return true;
  router.navigate(['/login']);
  return false;
};
