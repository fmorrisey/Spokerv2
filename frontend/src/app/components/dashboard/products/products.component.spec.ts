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

  const mockProducts = [
    { _id: '1', name: 'Widget', description: 'A test widget', msrp: 100, price: 90 },
    { _id: '2', name: 'Gadget', description: 'A test gadget', msrp: 200, price: 180 }
  ];

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

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('calls loadProducts() on init', () => {
      expect(productService.getAll).toHaveBeenCalled();
    });

    it('initializes with closed delete modal', () => {
      expect(component.isDeleteModalOpen).toBeFalse();
      expect(component.deleteCandidate).toBeNull();
    });
  });

  describe('loadProducts()', () => {
    it('calls productService.getAll()', async () => {
      productService.getAll.calls.reset();
      
      await component.loadProducts();
      
      expect(productService.getAll).toHaveBeenCalled();
    });
  });

  describe('Delete confirmation modal', () => {
    it('opens delete modal with product details', () => {
      component.openDeleteConfirm('1', 'Widget');
      
      expect(component.isDeleteModalOpen).toBeTrue();
      expect(component.deleteCandidate).toEqual({ id: '1', name: 'Widget' });
    });

    it('does not open modal when product id is undefined', () => {
      component.openDeleteConfirm(undefined, 'Widget');
      
      expect(component.isDeleteModalOpen).toBeFalse();
      expect(component.deleteCandidate).toBeNull();
    });

    it('closes delete modal and clears candidate', () => {
      component.openDeleteConfirm('1', 'Widget');
      component.closeDeleteConfirm();
      
      expect(component.isDeleteModalOpen).toBeFalse();
      expect(component.deleteCandidate).toBeNull();
    });

    it('confirms delete and closes modal', async () => {
      component.openDeleteConfirm('1', 'Widget');
      
      await component.confirmDelete();
      
      expect(productService.delete).toHaveBeenCalledWith('1');
      expect(component.isDeleteModalOpen).toBeFalse();
      expect(component.deleteCandidate).toBeNull();
    });

    it('does not call delete when no candidate exists', async () => {
      component.deleteCandidate = null;
      
      await component.confirmDelete();
      
      expect(productService.delete).not.toHaveBeenCalled();
    });

    it('displays delete modal in template when open', () => {
      component.openDeleteConfirm('1', 'Widget');
      fixture.detectChanges();
      
      const modal = fixture.nativeElement.querySelector('.modal-backdrop');
      const modalTitle = fixture.nativeElement.querySelector('#delete-modal-title');
      
      expect(modal).toBeTruthy();
      expect(modalTitle?.textContent).toContain('Delete product?');
    });

    it('displays product name in delete modal', () => {
      component.openDeleteConfirm('1', 'Widget');
      fixture.detectChanges();
      
      const modalContent = fixture.nativeElement.querySelector('.modal p');
      
      expect(modalContent?.textContent).toContain('Widget');
    });

    it('does not display modal when closed', () => {
      component.isDeleteModalOpen = false;
      fixture.detectChanges();
      
      const modal = fixture.nativeElement.querySelector('.modal-backdrop');
      
      expect(modal).toBeFalsy();
    });
  });

  describe('formatCurrency()', () => {
    it('formats whole numbers correctly', () => {
      expect(component.formatCurrency(100)).toBe('$100.00');
    });

    it('formats decimal numbers correctly', () => {
      expect(component.formatCurrency(12.5)).toBe('$12.50');
    });

    it('formats large numbers correctly', () => {
      expect(component.formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('formats zero correctly', () => {
      expect(component.formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers correctly', () => {
      expect(component.formatCurrency(-50.25)).toBe('-$50.25');
    });

    it('rounds to two decimal places', () => {
      expect(component.formatCurrency(10.999)).toBe('$11.00');
    });
  });

  describe('Loading state display', () => {
    it('shows loading message when loading', () => {
      productService.loading.set(true);
      fixture.detectChanges();
      
      const loading = fixture.nativeElement.querySelector('.loading');
      
      expect(loading).toBeTruthy();
      expect(loading?.textContent).toContain('Loading products...');
    });

    it('does not show loading when not loading', () => {
      productService.loading.set(false);
      fixture.detectChanges();
      
      const loading = fixture.nativeElement.querySelector('.loading');
      
      expect(loading).toBeFalsy();
    });
  });

  describe('Error state display', () => {
    it('shows error message when error exists', () => {
      productService.error.set('Failed to load products');
      fixture.detectChanges();
      
      const errorMessage = fixture.nativeElement.querySelector('.error-message');
      
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('Failed to load products');
    });

    it('shows retry button on error', () => {
      productService.error.set('Failed to load products');
      fixture.detectChanges();
      
      const retryButton = fixture.nativeElement.querySelector('.error-message button');
      
      expect(retryButton).toBeTruthy();
      expect(retryButton?.textContent).toContain('Retry');
    });

    it('calls loadProducts() when retry button is clicked', () => {
      productService.error.set('Failed to load products');
      fixture.detectChanges();
      productService.getAll.calls.reset();
      
      const retryButton = fixture.nativeElement.querySelector('.error-message button');
      retryButton?.click();
      
      expect(productService.getAll).toHaveBeenCalled();
    });

    it('does not show error when no error exists', () => {
      productService.error.set(null);
      fixture.detectChanges();
      
      const errorMessage = fixture.nativeElement.querySelector('.error-message');
      
      expect(errorMessage).toBeFalsy();
    });
  });

  describe('Empty state display', () => {
    it('shows empty state when there are no products', () => {
      productService.products.set([]);
      productService.loading.set(false);
      productService.error.set(null);
      fixture.detectChanges();
      
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('No products found');
    });

    it('does not show empty state when products exist', () => {
      productService.products.set(mockProducts);
      productService.loading.set(false);
      productService.error.set(null);
      fixture.detectChanges();
      
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      
      expect(emptyState).toBeFalsy();
    });

    it('does not show empty state when loading', () => {
      productService.products.set([]);
      productService.loading.set(true);
      fixture.detectChanges();
      
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      
      expect(emptyState).toBeFalsy();
    });

    it('does not show empty state when error exists', () => {
      productService.products.set([]);
      productService.loading.set(false);
      productService.error.set('Error');
      fixture.detectChanges();
      
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      
      expect(emptyState).toBeFalsy();
    });
  });

  describe('Product listing display', () => {
    beforeEach(() => {
      productService.products.set(mockProducts);
      productService.loading.set(false);
      productService.error.set(null);
      fixture.detectChanges();
    });

    it('displays products in a grid', () => {
      const productsGrid = fixture.nativeElement.querySelector('.products-grid');
      const productCards = fixture.nativeElement.querySelectorAll('.product-card');
      
      expect(productsGrid).toBeTruthy();
      expect(productCards.length).toBe(2);
    });

    it('displays product names', () => {
      const productCards = fixture.nativeElement.querySelectorAll('.product-card h3');
      
      expect(productCards[0]?.textContent).toContain('Widget');
      expect(productCards[1]?.textContent).toContain('Gadget');
    });

    it('displays product descriptions', () => {
      const descriptions = fixture.nativeElement.querySelectorAll('.product-description');
      
      expect(descriptions[0]?.textContent).toContain('A test widget');
      expect(descriptions[1]?.textContent).toContain('A test gadget');
    });

    it('displays MSRP and price for each product', () => {
      const priceItems = fixture.nativeElement.querySelectorAll('.price-item');
      
      expect(priceItems.length).toBeGreaterThan(0);
    });

    it('displays savings when price is less than MSRP', () => {
      const savings = fixture.nativeElement.querySelectorAll('.savings');
      
      // Both mock products have price < MSRP, so should show savings
      expect(savings.length).toBe(2);
      expect(savings[0]?.textContent).toContain('Save');
    });

    it('has delete button for each product', () => {
      const deleteButtons = fixture.nativeElement.querySelectorAll('.product-actions button[title="Delete"]');
      
      expect(deleteButtons.length).toBe(2);
    });

    it('opens delete modal when delete button is clicked', () => {
      const deleteButton = fixture.nativeElement.querySelector('.product-actions button[title="Delete"]');
      
      deleteButton?.click();
      
      expect(component.isDeleteModalOpen).toBeTrue();
      expect(component.deleteCandidate).toBeTruthy();
    });

    it('formats currency values in product display', () => {
      const msrpValues = fixture.nativeElement.querySelectorAll('.value.msrp');
      const priceValues = fixture.nativeElement.querySelectorAll('.value.price');
      
      expect(msrpValues[0]?.textContent).toContain('$100.00');
      expect(priceValues[0]?.textContent).toContain('$90.00');
    });
  });

  describe('Component accessibility', () => {
    it('delete modal has proper ARIA attributes', () => {
      component.openDeleteConfirm('1', 'Widget');
      fixture.detectChanges();
      
      const modal = fixture.nativeElement.querySelector('.modal-backdrop');
      
      expect(modal?.getAttribute('role')).toBe('dialog');
      expect(modal?.getAttribute('aria-modal')).toBe('true');
      expect(modal?.getAttribute('aria-labelledby')).toBe('delete-modal-title');
    });

    it('delete buttons have aria-label', () => {
      productService.products.set(mockProducts);
      fixture.detectChanges();
      
      const deleteButtons = fixture.nativeElement.querySelectorAll('.product-actions button[title="Delete"]');
      
      expect(deleteButtons[0]?.getAttribute('aria-label')).toContain('Delete product');
    });

    it('disabled Add Product buttons have aria-disabled', () => {
      const addButtons = fixture.nativeElement.querySelectorAll('button[disabled]');
      
      addButtons.forEach((button: HTMLElement) => {
        if (button.textContent?.includes('Add Product')) {
          expect(button.getAttribute('aria-disabled')).toBe('true');
        }
      });
    });
  });
});
