import { Injectable, signal } from '@angular/core';
import type { ProductComponents } from '../../../swagger';

type Product = ProductComponents['schemas']['Product'];

const SESSION_KEY = 'demo_products';

// Seed data mirroring a subset of backend Product.seed()
const SEED_PRODUCTS: Product[] = [
  { _id: 'demo-1', name: 'Wireless Headphones', description: 'Premium noise-canceling wireless headphones with 30-hour battery life.', msrp: 299.99, price: 249.99 },
  { _id: 'demo-2', name: 'Mechanical Keyboard', description: 'Compact 75% mechanical keyboard with RGB backlighting and tactile switches.', msrp: 149.99, price: 119.99 },
  { _id: 'demo-3', name: 'USB-C Hub', description: '7-in-1 USB-C hub with 4K HDMI, 100W PD charging, and SD card reader.', msrp: 79.99, price: 59.99 },
  { _id: 'demo-4', name: 'Desk Lamp', description: 'LED desk lamp with adjustable color temperature and wireless charging base.', msrp: 89.99, price: 69.99 },
  { _id: 'demo-5', name: 'Webcam 4K', description: 'Ultra HD 4K webcam with auto-focus and built-in noise-canceling microphone.', msrp: 199.99, price: 159.99 },
  { _id: 'demo-6', name: 'Standing Desk Mat', description: 'Anti-fatigue standing desk mat with beveled edges and non-slip bottom.', msrp: 59.99, price: 44.99 },
  { _id: 'demo-7', name: 'Monitor Arm', description: 'Fully adjustable single monitor arm supporting up to 32" displays.', msrp: 119.99, price: 89.99 },
  { _id: 'demo-8', name: 'Cable Management Kit', description: 'Complete cable management kit with sleeves, clips, and velcro ties.', msrp: 24.99, price: 17.99 },
];

export type DemoRole = 'owner' | 'customer';

@Injectable({ providedIn: 'root' })
export class DemoService {
  demoRole = signal<DemoRole>('owner');

  private get storedProducts(): Product[] {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private save(products: Product[]): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(products));
  }

  initSessionData(): void {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      this.save([...SEED_PRODUCTS]);
    }
  }

  getAll(): Product[] {
    return this.storedProducts ?? SEED_PRODUCTS;
  }

  getById(id: string): Product | null {
    return this.getAll().find(p => p._id === id) ?? null;
  }

  create(data: Omit<Product, '_id'>): Product {
    const products = this.getAll();
    const newProduct: Product = { ...data, _id: `demo-${Date.now()}` };
    this.save([...products, newProduct]);
    return newProduct;
  }

  update(id: string, data: Omit<Product, '_id'>): Product | null {
    const products = this.getAll();
    const idx = products.findIndex(p => p._id === id);
    if (idx === -1) return null;
    const updated: Product = { ...data, _id: id };
    products[idx] = updated;
    this.save(products);
    return updated;
  }

  delete(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter(p => p._id !== id);
    if (filtered.length === products.length) return false;
    this.save(filtered);
    return true;
  }

  toggleRole(): void {
    this.demoRole.set(this.demoRole() === 'owner' ? 'customer' : 'owner');
  }

  setRole(role: DemoRole): void {
    this.demoRole.set(role);
  }

  resetSessionData(): void {
    this.save([...SEED_PRODUCTS]);
  }
}
