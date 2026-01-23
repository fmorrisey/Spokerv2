import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';
import { ApiClientService } from '../apiClient/api-client.service';

describe('ProductService', () => {
  let service: ProductService;
  let apiClient: {
    GET: jasmine.Spy;
    POST: jasmine.Spy;
    PUT: jasmine.Spy;
    DELETE: jasmine.Spy;
  };

  beforeEach(() => {
    apiClient = {
      GET: jasmine.createSpy('GET'),
      POST: jasmine.createSpy('POST'),
      PUT: jasmine.createSpy('PUT'),
      DELETE: jasmine.createSpy('DELETE')
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiClientService,
          useValue: {
            getClient: () => apiClient
          }
        }
      ]
    });
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads products and clears loading state', async () => {
    const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
    apiClient.GET.and.resolveTo({ data: [product], error: null });

    await service.getAll();

    expect(service.products()).toEqual([product]);
    expect(service.loading()).toBeFalse();
    expect(service.error()).toBeNull();
  });

  it('sets error when getAll fails', async () => {
    apiClient.GET.and.resolveTo({ data: null, error: new Error('fail') });

    await service.getAll();

    expect(service.error()).toBe('Failed to fetch products');
    expect(service.loading()).toBeFalse();
  });

  it('creates a product and updates local state', async () => {
    const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
    apiClient.POST.and.resolveTo({ data: product, error: null });

    const result = await service.create({
      name: 'Widget',
      description: 'Test',
      msrp: 100,
      price: 90
    } as never);

    expect(result).toEqual(product);
    expect(service.products()).toEqual([product]);
  });

  it('updates a product in local state', async () => {
    const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
    const updated = { ...product, name: 'Updated' };
    service.products.set([product]);
    apiClient.PUT.and.resolveTo({ data: updated, error: null });

    const result = await service.update('1', {
      name: 'Updated',
      description: 'Test',
      msrp: 100,
      price: 90
    } as never);

    expect(result).toEqual(updated);
    expect(service.products()).toEqual([updated]);
  });

  it('deletes a product from local state', async () => {
    const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
    service.products.set([product]);
    apiClient.DELETE.and.resolveTo({ error: null });

    const result = await service.delete('1');

    expect(result).toBeTrue();
    expect(service.products()).toEqual([]);
  });

  it('handles network errors during create', async () => {
    apiClient.POST.and.rejectWith(new Error('Network'));

    const result = await service.create({
      name: 'Widget',
      description: 'Test',
      msrp: 100,
      price: 90
    } as never);

    expect(result).toBeNull();
    expect(service.error()).toBe('Network error');
  });
});
