import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiClientService } from '../apiClient/api-client.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockClient: any;
  let mockApiClientService: jasmine.SpyObj<ApiClientService>;
  let router: Router;

  beforeEach(() => {
    mockClient = {
      POST: jasmine.createSpy('POST'),
      GET: jasmine.createSpy('GET'),
    };

    mockApiClientService = jasmine.createSpyObj('ApiClientService', ['getClient']);
    mockApiClientService.getClient.and.returnValue(mockClient);

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem').and.stub();
    spyOn(localStorage, 'removeItem').and.stub();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        { provide: ApiClientService, useValue: mockApiClientService },
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should have isAuthenticated false by default', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should have currentUser null by default', () => {
    expect(service.currentUser()).toBeNull();
  });

  describe('login', () => {
    it('should set token and user on successful login', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User', role: 'customer' as const };
      mockClient.POST.and.returnValue(Promise.resolve({ data: { accessToken: 'token123', user: mockUser }, error: null }));

      await service.login('test@example.com', 'password');

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'token123');
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should throw on login error', async () => {
      mockClient.POST.and.returnValue(Promise.resolve({ data: null, error: new Error('Unauthorized') }));

      await expectAsync(service.login('test@example.com', 'wrong')).toBeRejected();
    });
  });

  describe('register', () => {
    it('should set token and user on successful registration', async () => {
      const mockUser = { email: 'new@example.com', name: 'New User', role: 'customer' as const };
      mockClient.POST.and.returnValue(Promise.resolve({ data: { accessToken: 'newtoken', user: mockUser }, error: null }));

      await service.register('new@example.com', 'password123', 'New User');

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'newtoken');
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should throw on registration error', async () => {
      mockClient.POST.and.returnValue(Promise.resolve({ data: null, error: new Error('Conflict') }));

      await expectAsync(service.register('exists@example.com', 'password123', 'User')).toBeRejected();
    });
  });

  describe('logout', () => {
    it('should clear token and user on logout', async () => {
      mockClient.POST.and.returnValue(Promise.resolve({}));

      await service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
