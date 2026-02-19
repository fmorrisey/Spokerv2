import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth/auth.service';
import { ConfigService } from '../services/config.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';

describe('authGuard', () => {
  let mockAuthService: { isAuthenticated: jasmine.Spy; loadCurrentUser: jasmine.Spy };
  let mockConfigService: { demoMode: ReturnType<typeof signal<boolean>> };
  let router: Router;

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
  }

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: jasmine.createSpy('isAuthenticated'),
      loadCurrentUser: jasmine.createSpy('loadCurrentUser').and.returnValue(Promise.resolve()),
    };
    mockConfigService = { demoMode: signal(false) };

    spyOn(localStorage, 'getItem').and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should allow access when isAuthenticated is true', async () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    const result = await runGuard();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access immediately when demo mode is on', async () => {
    mockConfigService.demoMode.set(true);

    const result = await runGuard();

    expect(result).toBe(true);
    expect(mockAuthService.loadCurrentUser).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should await loadCurrentUser and allow access when token is valid', async () => {
    mockAuthService.isAuthenticated.and.returnValues(false, true);
    (localStorage.getItem as jasmine.Spy).and.returnValue('sometoken');

    const result = await runGuard();

    expect(mockAuthService.loadCurrentUser).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /login when token is invalid after validation', async () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue('expiredtoken');

    const result = await runGuard();

    expect(mockAuthService.loadCurrentUser).toHaveBeenCalled();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to /login when not authenticated and no token', async () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    const result = await runGuard();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
