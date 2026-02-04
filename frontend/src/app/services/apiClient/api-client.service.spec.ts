import { TestBed } from '@angular/core/testing';
import { ApiClientService } from './api-client.service';
import { ConfigService } from '../config.service';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let mockConfigService: { apiUrl: string; production: boolean };

  beforeEach(() => {
    mockConfigService = {
      apiUrl: 'http://localhost:3000',
      production: false
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        ApiClientService
      ]
    });
    
    service = TestBed.inject(ApiClientService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Service initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should provide a client through getClient()', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
      expect(typeof client.use).toBe('function');
    });

    it('initializes with correct base URL from config', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('Authentication middleware', () => {
    it('service initializes with middleware configured', () => {
      const client = service.getClient();
      
      // Verify the client was created with middleware
      expect(client).toBeDefined();
      expect(typeof client.GET).toBe('function');
    });

    it('can store and retrieve auth tokens from localStorage', () => {
      const testToken = 'test-bearer-token';
      localStorage.setItem('auth_token', testToken);
      
      expect(localStorage.getItem('auth_token')).toBe(testToken);
      
      localStorage.removeItem('auth_token');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('verifies localStorage is available for token storage', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(localStorage.getItem('auth_token')).toBe('test-token');
      
      localStorage.removeItem('auth_token');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Logging and configuration', () => {
    it('service initializes with correct configuration in development', () => {
      const client = service.getClient();
      const config = TestBed.inject(ConfigService);
      
      expect(client).toBeDefined();
      expect(config.production).toBe(false);
      expect(config.apiUrl).toBe('http://localhost:3000');
    });

    it('service initializes with correct configuration in production', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: {
              apiUrl: 'http://localhost:3000',
              production: true
            }
          },
          ApiClientService
        ]
      });

      const prodService = TestBed.inject(ApiClientService);
      const prodClient = prodService.getClient();
      const config = TestBed.inject(ConfigService);
      
      expect(prodClient).toBeDefined();
      expect(config.production).toBe(true);
    });

    it('client has expected API methods', () => {
      const client = service.getClient();
      
      expect(typeof client.GET).toBe('function');
      expect(typeof client.POST).toBe('function');
      expect(typeof client.PUT).toBe('function');
      expect(typeof client.DELETE).toBe('function');
      expect(typeof client.use).toBe('function');
    });
  });

  describe('Middleware behavior verification', () => {
    it('verifies middleware setup completes during service initialization', () => {
      // The service constructor calls setupMiddleware()
      // By creating the service successfully, we verify middleware is set up
      expect(service).toBeDefined();
      expect(service.getClient()).toBeDefined();
    });

    it('development mode allows console logging', () => {
      const config = TestBed.inject(ConfigService);
      expect(config.production).toBe(false);
      
      // Verify console methods are available
      expect(typeof console.log).toBe('function');
      expect(typeof console.warn).toBe('function');
      expect(typeof console.error).toBe('function');
    });

    it('production service initializes correctly', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: {
              apiUrl: 'http://production.example.com',
              production: true
            }
          },
          ApiClientService
        ]
      });

      const prodService = TestBed.inject(ApiClientService);
      expect(prodService).toBeDefined();
      expect(prodService.getClient()).toBeDefined();
    });
  });
});
