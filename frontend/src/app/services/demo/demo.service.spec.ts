import { TestBed } from '@angular/core/testing';
import { DemoService } from './demo.service';

describe('DemoService', () => {
  let service: DemoService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should default demoRole to owner', () => {
    expect(service.demoRole()).toBe('owner');
  });

  describe('initSessionData', () => {
    it('should seed session storage if not already seeded', () => {
      service.initSessionData();
      const products = service.getAll();
      expect(products.length).toBeGreaterThan(0);
    });

    it('should not overwrite existing session data', () => {
      service.initSessionData();
      service.create({ name: 'Custom', description: 'Test', msrp: 10, price: 8 });
      const countAfterCreate = service.getAll().length;

      service.initSessionData(); // should no-op
      expect(service.getAll().length).toBe(countAfterCreate);
    });
  });

  describe('getAll', () => {
    it('should return seed data when session storage is empty', () => {
      const products = service.getAll();
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]._id).toContain('demo-');
    });
  });

  describe('getById', () => {
    it('should return product by id', () => {
      service.initSessionData();
      const all = service.getAll();
      const found = service.getById(all[0]._id!);
      expect(found).not.toBeNull();
      expect(found?._id).toBe(all[0]._id);
    });

    it('should return null for unknown id', () => {
      expect(service.getById('nonexistent')).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a product and persist to session storage', () => {
      service.initSessionData();
      const before = service.getAll().length;
      const created = service.create({ name: 'New', description: 'Desc', msrp: 20, price: 15 });
      expect(service.getAll().length).toBe(before + 1);
      expect(created._id).toBeTruthy();
      expect(created.name).toBe('New');
    });
  });

  describe('update', () => {
    it('should update an existing product', () => {
      service.initSessionData();
      const id = service.getAll()[0]._id!;
      const updated = service.update(id, { name: 'Updated', description: 'New desc', msrp: 99, price: 79 });
      expect(updated?.name).toBe('Updated');
      expect(service.getById(id)?.name).toBe('Updated');
    });

    it('should return null for unknown id', () => {
      expect(service.update('bad-id', { name: 'x', description: 'y', msrp: 1, price: 1 })).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove a product from session storage', () => {
      service.initSessionData();
      const id = service.getAll()[0]._id!;
      const before = service.getAll().length;
      expect(service.delete(id)).toBe(true);
      expect(service.getAll().length).toBe(before - 1);
      expect(service.getById(id)).toBeNull();
    });

    it('should return false for unknown id', () => {
      expect(service.delete('nonexistent')).toBe(false);
    });
  });

  describe('toggleRole', () => {
    it('should toggle from owner to customer', () => {
      expect(service.demoRole()).toBe('owner');
      service.toggleRole();
      expect(service.demoRole()).toBe('customer');
    });

    it('should toggle back to owner', () => {
      service.toggleRole();
      service.toggleRole();
      expect(service.demoRole()).toBe('owner');
    });
  });

  describe('setRole', () => {
    it('should set role to customer', () => {
      service.setRole('customer');
      expect(service.demoRole()).toBe('customer');
    });
  });

  describe('resetSessionData', () => {
    it('should restore seed data after modifications', () => {
      service.initSessionData();
      service.create({ name: 'Extra', description: 'Extra', msrp: 5, price: 4 });
      const countAfterCreate = service.getAll().length;

      service.resetSessionData();
      expect(service.getAll().length).toBeLessThan(countAfterCreate);
    });
  });
});
