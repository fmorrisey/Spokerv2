import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let mockAuthService: { isAuthenticated: jasmine.Spy };
  let router: Router;

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
  }

  beforeEach(() => {
    mockAuthService = { isAuthenticated: jasmine.createSpy('isAuthenticated') };

    spyOn(localStorage, 'getItem').and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should allow access when isAuthenticated is true', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    const result = runGuard();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access when token exists in localStorage', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue('sometoken');

    const result = runGuard();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /login when not authenticated and no token', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    const result = runGuard();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
