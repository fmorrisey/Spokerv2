import { Injectable, inject, signal } from '@angular/core';
import { ApiClientService } from '../apiClient/api-client.service';
import { ConfigService } from '../config.service';
import { DemoService } from '../demo/demo.service';
import type { ProductComponents } from '../../../swagger';

type Product = ProductComponents['schemas']['Product'];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = inject(ApiClientService).getClient();
  private config = inject(ConfigService);
  private demo = inject(DemoService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async getAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.config.demoMode()) {
        this.demo.initSessionData();
        this.products.set(this.demo.getAll());
        return;
      }

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

  async getById(id: string): Promise<Product | null> {
    try {
      if (this.config.demoMode()) {
        return this.demo.getById(id);
      }

      const { data, error } = await this.api.GET('/api/v1/products/{id}', {
        params: { path: { id } }
      });
      if (error) { console.error(error); return null; }
      return data || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async create(product: Omit<Product, '_id'>): Promise<Product | null> {
    try {
      if (this.config.demoMode()) {
        const created = this.demo.create(product);
        this.products.update(products => [...products, created]);
        return created;
      }

      const { data, error } = await this.api.POST('/api/v1/products', { body: product });
      if (error) { this.error.set('Failed to create product'); console.error(error); return null; }
      if (!data) { this.error.set('No product returned from API'); return null; }
      this.products.update(products => [...products, data]);
      return data;
    } catch (err) {
      this.error.set('Network error');
      console.error(err);
      return null;
    }
  }

  async update(id: string, product: Omit<Product, '_id'>): Promise<Product | null> {
    try {
      if (this.config.demoMode()) {
        const updated = this.demo.update(id, product);
        if (updated) this.products.update(products => products.map(p => p._id === id ? updated : p));
        return updated;
      }

      const { data, error } = await this.api.PUT('/api/v1/products/{id}', {
        params: { path: { id } },
        body: product
      });
      if (error) { this.error.set('Failed to update product'); console.error(error); return null; }
      if (!data) { this.error.set('No product returned from API'); return null; }
      this.products.update(products => products.map(p => p._id === id ? data : p));
      return data;
    } catch (err) {
      this.error.set('Network error');
      console.error(err);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (this.config.demoMode()) {
        const deleted = this.demo.delete(id);
        if (deleted) this.products.update(products => products.filter(p => p._id !== id));
        return deleted;
      }

      const { error } = await this.api.DELETE('/api/v1/products/{id}', {
        params: { path: { id } }
      });
      if (error) { this.error.set('Failed to delete product'); console.error(error); return false; }
      this.products.update(products => products.filter(p => p._id !== id));
      return true;
    } catch (err) {
      this.error.set('Network error');
      console.error(err);
      return false;
    }
  }
}
