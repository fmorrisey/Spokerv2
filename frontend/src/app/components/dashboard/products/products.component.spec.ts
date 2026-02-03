import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ProductsComponent } from './products.component';
import { ProductService } from '../../../services/product/product.service';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productService: {
    getAll: jasmine.Spy;
    delete: jasmine.Spy;
    products: ReturnType<typeof signal>;
    loading: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
  };

  beforeEach(async () => {
    productService = {
      getAll: jasmine.createSpy('getAll').and.resolveTo(),
      delete: jasmine.createSpy('delete').and.resolveTo(true),
      products: signal([]),
      loading: signal(false),
      error: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        {
          provide: ProductService,
          useValue: productService
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads products on init', () => {
    expect(productService.getAll).toHaveBeenCalled();
  });

  it('opens and confirms delete modal', async () => {
    component.openDeleteConfirm('1', 'Widget');
    expect(component.isDeleteModalOpen).toBeTrue();

    await component.confirmDelete();

    expect(productService.delete).toHaveBeenCalledWith('1');
    expect(component.isDeleteModalOpen).toBeFalse();
  });

  it('formats currency values', () => {
    expect(component.formatCurrency(12.5)).toBe('$12.50');
  });

  it('shows empty state when there are no products', () => {
    productService.products.set([]);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });
});
