import { TestBed } from '@angular/core/testing';
import * as openapiFetch from 'openapi-fetch';

import { ApiClientService } from './api-client.service';
import { ConfigService } from '../config.service';
import type { Middleware } from 'openapi-fetch';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let useSpy: jasmine.Spy;
  let client: { use: jasmine.Spy };

  beforeEach(() => {
    client = { use: jasmine.createSpy('use') };
    useSpy = client.use;
    spyOn(openapiFetch, 'default').and.returnValue(client as never);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            apiUrl: 'http://localhost:3000',
            production: false
          }
        }
      ]
    });
    service = TestBed.inject(ApiClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('registers auth and logging middleware in development', () => {
    expect(useSpy.calls.count()).toBe(2);
  });

  it('adds auth token to requests when available', async () => {
    const authMiddleware = useSpy.calls.argsFor(0)[0] as Middleware;
    localStorage.setItem('auth_token', 'token-123');

    const request = new Request('http://localhost:3000/api/v1/products');
    await authMiddleware.onRequest?.({ request });

    expect(request.headers.get('Authorization')).toBe('Bearer token-123');
    localStorage.removeItem('auth_token');
  });

  it('clears auth token on 401 responses', async () => {
    const authMiddleware = useSpy.calls.argsFor(0)[0] as Middleware;
    localStorage.setItem('auth_token', 'token-123');

    const response = new Response(null, { status: 401 });
    const request = new Request('http://localhost:3000/api/v1/products');
    await authMiddleware.onResponse?.({ response, request });

    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('logs API traffic in development', async () => {
    const loggingMiddleware = useSpy.calls.argsFor(1)[0] as Middleware;
    const logSpy = spyOn(console, 'log');
    const request = new Request('http://localhost:3000/api/v1/products', { method: 'GET' });
    const response = new Response(null, { status: 200 });

    await loggingMiddleware.onRequest?.({ request });
    await loggingMiddleware.onResponse?.({ response, request });

    expect(logSpy).toHaveBeenCalled();
  });

  it('skips logging middleware in production', () => {
    TestBed.resetTestingModule();
    client = { use: jasmine.createSpy('use') };
    useSpy = client.use;
    (openapiFetch.default as jasmine.Spy).and.returnValue(client as never);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            apiUrl: 'http://localhost:3000',
            production: true
          }
        }
      ]
    });

    service = TestBed.inject(ApiClientService);

    expect(service).toBeTruthy();
    expect(useSpy.calls.count()).toBe(1);
  });
});
