import { Injectable, inject, signal } from '@angular/core';
import { ApiClientService } from '../apiClient/api-client.service';
import type { ProductComponents } from '../../../swagger';

type Product = ProductComponents['schemas']['Product'];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = inject(ApiClientService).getClient();
  
  // State management with signals
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  /**
   * Get all products
   */
  async getAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.api.GET('/api/v1/products');
      
      if (error) {
        this.error.set('Failed to fetch products');
        console.error(error);
        return;
      }

      this.products.set(data || []);
    } catch (err) {
      this.error.set('Network error');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await this.api.GET('/api/v1/products/{id}', {
      params: {
        path: { id }
      }
    });

    if (error) {
      console.error(error);
      return null;
    }

    return data || null;
  }

  /**
   * Create a new product
   */
  async create(product: Omit<Product, '_id'>): Promise<Product | null> {
    const { data, error } = await this.api.POST('/api/v1/products', {
      body: product
    });

    if (error) {
      this.error.set('Failed to create product');
      console.error(error);
      return null;
    }

    if (!data) {
      this.error.set('No product returned from API');
      console.error('No product returned from create');
      return null;
    }

    // Update local state
    this.products.update(products => [...products, data]);
    return data;
  }

  /**
   * Update an existing product
   */
  async update(id: string, product: Omit<Product, '_id'>): Promise<Product | null> {
    const { data, error } = await this.api.PUT('/api/v1/products/{id}', {
      params: {
        path: { id }
      },
      body: product
    });

    if (error) {
      this.error.set('Failed to update product');
      console.error(error);
      return null;
    }

    if (!data) {
      this.error.set('No product returned from API');
      console.error('No product returned from update');
      return null;
    }

    // Update local state
    this.products.update(products => 
      products.map(p => p._id === id ? data : p)
    );
    return data;
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.api.DELETE('/api/v1/products/{id}', {
      params: {
        path: { id }
      }
    });

    if (error) {
      this.error.set('Failed to delete product');
      console.error(error);
      return false;
    }

    // Update local state
    this.products.update(products => 
      products.filter(p => p._id !== id)
    );
    return true;
  }
}