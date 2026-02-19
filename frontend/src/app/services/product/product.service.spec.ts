import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ProductService } from './product.service';
import { ApiClientService } from '../apiClient/api-client.service';
import { ConfigService } from '../config.service';
import { DemoService } from '../demo/demo.service';

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
          useValue: { getClient: () => apiClient }
        },
        {
          provide: ConfigService,
          useValue: { demoMode: signal(false) }
        },
        {
          provide: DemoService,
          useValue: {
            demoRole: signal('owner'),
            initSessionData: jasmine.createSpy(),
            getAll: jasmine.createSpy().and.returnValue([]),
            getById: jasmine.createSpy().and.returnValue(null),
            create: jasmine.createSpy(),
            update: jasmine.createSpy(),
            delete: jasmine.createSpy(),
          }
        }
      ]
    });
    service = TestBed.inject(ProductService);
  });

  describe('Service initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('initializes with empty state', () => {
      expect(service.products()).toEqual([]);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });
  });

  describe('getAll()', () => {
    it('sets loading state during API call', async () => {
      apiClient.GET.and.returnValue(new Promise(() => {})); // Never resolves
      
      const promise = service.getAll();
      
      expect(service.loading()).toBeTrue();
      expect(service.error()).toBeNull();
    });

    it('loads products and clears loading state', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      apiClient.GET.and.resolveTo({ data: [product], error: null });

      await service.getAll();

      expect(service.products()).toEqual([product]);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('handles empty product list', async () => {
      apiClient.GET.and.resolveTo({ data: [], error: null });

      await service.getAll();

      expect(service.products()).toEqual([]);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('sets error when API returns error', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.GET.and.resolveTo({ data: null, error: new Error('API error') });

      await service.getAll();

      expect(service.error()).toBe('Failed to fetch products');
      expect(service.loading()).toBeFalse();
      expect(service.products()).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles network errors and sets error message', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.GET.and.rejectWith(new Error('Network failure'));

      await service.getAll();

      expect(service.error()).toBe('Network error');
      expect(service.loading()).toBeFalse();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('clears previous error state on new request', async () => {
      service.error.set('Previous error');
      apiClient.GET.and.resolveTo({ data: [], error: null });

      await service.getAll();

      expect(service.error()).toBeNull();
    });

    it('handles null data from API', async () => {
      apiClient.GET.and.resolveTo({ data: null, error: null });

      await service.getAll();

      expect(service.products()).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('returns product when found', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      apiClient.GET.and.resolveTo({ data: product, error: null });

      const result = await service.getById('1');

      expect(result).toEqual(product);
      expect(apiClient.GET).toHaveBeenCalledWith('/api/v1/products/{id}', {
        params: { path: { id: '1' } }
      });
    });

    it('returns null when API returns error', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.GET.and.resolveTo({ data: null, error: new Error('Not found') });

      const result = await service.getById('999');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('returns null on network error', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.GET.and.rejectWith(new Error('Network error'));

      const result = await service.getById('1');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles null data from API', async () => {
      apiClient.GET.and.resolveTo({ data: null, error: null });

      const result = await service.getById('1');

      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    const newProduct = {
      name: 'Widget',
      description: 'Test',
      msrp: 100,
      price: 90
    };

    it('creates a product and updates local state', async () => {
      const createdProduct = { _id: '1', ...newProduct };
      apiClient.POST.and.resolveTo({ data: createdProduct, error: null });

      const result = await service.create(newProduct as never);

      expect(result).toEqual(createdProduct);
      expect(service.products()).toEqual([createdProduct]);
      expect(apiClient.POST).toHaveBeenCalledWith('/api/v1/products', {
        body: newProduct
      });
    });

    it('appends new product to existing products', async () => {
      const existingProduct = { _id: '1', name: 'Existing', description: 'Test', msrp: 50, price: 45 };
      service.products.set([existingProduct]);
      
      const newCreatedProduct = { _id: '2', ...newProduct };
      apiClient.POST.and.resolveTo({ data: newCreatedProduct, error: null });

      await service.create(newProduct as never);

      expect(service.products()).toEqual([existingProduct, newCreatedProduct]);
    });

    it('sets error when API returns error', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.POST.and.resolveTo({ data: null, error: new Error('Create failed') });

      const result = await service.create(newProduct as never);

      expect(result).toBeNull();
      expect(service.error()).toBe('Failed to create product');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('sets error when API returns no data', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.POST.and.resolveTo({ data: null, error: null });

      const result = await service.create(newProduct as never);

      expect(result).toBeNull();
      expect(service.error()).toBe('No product returned from API');
    });

    it('handles network errors during create', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.POST.and.rejectWith(new Error('Network failure'));

      const result = await service.create(newProduct as never);

      expect(result).toBeNull();
      expect(service.error()).toBe('Network error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('does not update local state when create fails', async () => {
      const existingProduct = { _id: '1', name: 'Existing', description: 'Test', msrp: 50, price: 45 };
      service.products.set([existingProduct]);
      apiClient.POST.and.resolveTo({ data: null, error: new Error('Failed') });

      await service.create(newProduct as never);

      expect(service.products()).toEqual([existingProduct]);
    });
  });

  describe('update()', () => {
    const updateData = {
      name: 'Updated Widget',
      description: 'Updated description',
      msrp: 100,
      price: 90
    };

    it('updates a product in local state', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      const updated = { _id: '1', ...updateData };
      service.products.set([product]);
      apiClient.PUT.and.resolveTo({ data: updated, error: null });

      const result = await service.update('1', updateData as never);

      expect(result).toEqual(updated);
      expect(service.products()).toEqual([updated]);
      expect(apiClient.PUT).toHaveBeenCalledWith('/api/v1/products/{id}', {
        params: { path: { id: '1' } },
        body: updateData
      });
    });

    it('updates correct product in list with multiple products', async () => {
      const product1 = { _id: '1', name: 'Widget 1', description: 'Test', msrp: 100, price: 90 };
      const product2 = { _id: '2', name: 'Widget 2', description: 'Test', msrp: 50, price: 45 };
      const product3 = { _id: '3', name: 'Widget 3', description: 'Test', msrp: 75, price: 70 };
      
      service.products.set([product1, product2, product3]);
      
      const updatedProduct2 = { _id: '2', ...updateData };
      apiClient.PUT.and.resolveTo({ data: updatedProduct2, error: null });

      await service.update('2', updateData as never);

      expect(service.products()).toEqual([product1, updatedProduct2, product3]);
    });

    it('sets error when API returns error', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      service.products.set([product]);
      apiClient.PUT.and.resolveTo({ data: null, error: new Error('Update failed') });

      const result = await service.update('1', updateData as never);

      expect(result).toBeNull();
      expect(service.error()).toBe('Failed to update product');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('sets error when API returns no data', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.PUT.and.resolveTo({ data: null, error: null });

      const result = await service.update('1', updateData as never);

      expect(result).toBeNull();
      expect(service.error()).toBe('No product returned from API');
    });

    it('handles network errors during update', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      apiClient.PUT.and.rejectWith(new Error('Network failure'));

      const result = await service.update('1', updateData as never);

      expect(result).toBeNull();
      expect(service.error()).toBe('Network error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('does not update local state when update fails', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      service.products.set([product]);
      apiClient.PUT.and.resolveTo({ data: null, error: new Error('Failed') });

      await service.update('1', updateData as never);

      expect(service.products()).toEqual([product]);
    });
  });

  describe('delete()', () => {
    it('deletes a product from local state', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      service.products.set([product]);
      apiClient.DELETE.and.resolveTo({ error: null });

      const result = await service.delete('1');

      expect(result).toBeTrue();
      expect(service.products()).toEqual([]);
      expect(apiClient.DELETE).toHaveBeenCalledWith('/api/v1/products/{id}', {
        params: { path: { id: '1' } }
      });
    });

    it('removes only the specified product from list', async () => {
      const product1 = { _id: '1', name: 'Widget 1', description: 'Test', msrp: 100, price: 90 };
      const product2 = { _id: '2', name: 'Widget 2', description: 'Test', msrp: 50, price: 45 };
      const product3 = { _id: '3', name: 'Widget 3', description: 'Test', msrp: 75, price: 70 };
      
      service.products.set([product1, product2, product3]);
      apiClient.DELETE.and.resolveTo({ error: null });

      await service.delete('2');

      expect(service.products()).toEqual([product1, product3]);
    });

    it('sets error when API returns error', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      service.products.set([product]);
      apiClient.DELETE.and.resolveTo({ error: new Error('Delete failed') });

      const result = await service.delete('1');

      expect(result).toBeFalse();
      expect(service.error()).toBe('Failed to delete product');
      expect(service.products()).toEqual([product]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles network errors during delete', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      service.products.set([product]);
      apiClient.DELETE.and.rejectWith(new Error('Network failure'));

      const result = await service.delete('1');

      expect(result).toBeFalse();
      expect(service.error()).toBe('Network error');
      expect(service.products()).toEqual([product]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('does not update local state when delete fails', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      service.products.set([product]);
      apiClient.DELETE.and.resolveTo({ error: new Error('Failed') });

      await service.delete('1');

      expect(service.products()).toEqual([product]);
    });
  });

  describe('Signal state management', () => {
    it('maintains reactive state through signals', async () => {
      const product = { _id: '1', name: 'Widget', description: 'Test', msrp: 100, price: 90 };
      apiClient.GET.and.resolveTo({ data: [product], error: null });

      // Access signal value before change
      expect(service.products()).toEqual([]);

      await service.getAll();

      // Signal value should be updated
      expect(service.products()).toEqual([product]);
    });

    it('error signal persists across operations until cleared', async () => {
      apiClient.GET.and.resolveTo({ data: null, error: new Error('Failed') });
      
      await service.getAll();
      expect(service.error()).toBe('Failed to fetch products');

      // Error should persist
      expect(service.error()).toBe('Failed to fetch products');

      // Error should clear on next successful request
      apiClient.GET.and.resolveTo({ data: [], error: null });
      await service.getAll();
      expect(service.error()).toBeNull();
    });
  });
});
