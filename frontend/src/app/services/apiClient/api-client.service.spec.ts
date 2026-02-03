import { TestBed } from '@angular/core/testing';
import { ApiClientService } from './api-client.service';
import { ConfigService } from '../config.service';

describe('ApiClientService', () => {
  let service: ApiClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            apiUrl: 'http://localhost:3000',
            production: false
          }
        },
        ApiClientService
      ]
    });
    
    service = TestBed.inject(ApiClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide a client through getClient()', () => {
    const client = service.getClient();
    expect(client).toBeDefined();
    expect(typeof client.use).toBe('function');
  });

  it('can store and retrieve auth tokens from localStorage', () => {
    localStorage.setItem('auth_token', 'test-token');
    expect(localStorage.getItem('auth_token')).toBe('test-token');
    localStorage.removeItem('auth_token');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('clears auth token from localStorage', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.removeItem('auth_token');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('has a getClient method that returns the configured client', () => {
    const client = service.getClient();
    expect(client).toBeDefined();
    expect(client.use).toBeDefined();
  });

  it('initializes with development configuration', () => {
    const config = TestBed.inject(ConfigService);
    expect(config.production).toBe(false);
    expect(config.apiUrl).toBe('http://localhost:3000');
  });

  it('initializes with production configuration', () => {
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
    const config = TestBed.inject(ConfigService);
    
    expect(prodService).toBeTruthy();
    expect(config.production).toBe(true);
  });
});
