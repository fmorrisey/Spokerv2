import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ProductFormComponent, ProductFormData } from './product-form.component';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  const mockProduct = {
    _id: '1',
    name: 'Widget',
    description: 'A test widget',
    msrp: 100,
    price: 90
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('initializes with empty form data', () => {
      expect(component.formData.name).toBe('');
      expect(component.formData.description).toBe('');
      expect(component.formData.msrp).toBe(0);
      expect(component.formData.price).toBe(0);
    });

    it('initializes in create mode when no product is provided', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.title).toBe('Add Product');
    });
  });

  describe('Edit mode', () => {
    it('switches to edit mode when product is provided', () => {
      component.product = mockProduct;

      expect(component.isEditMode).toBeTrue();
      expect(component.title).toBe('Edit Product');
    });

    it('pre-populates form with product data when opened', () => {
      component.product = mockProduct;
      component.isOpen = true;
      component.ngOnChanges({
        isOpen: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
      });

      expect(component.formData.name).toBe('Widget');
      expect(component.formData.description).toBe('A test widget');
      expect(component.formData.msrp).toBe(100);
      expect(component.formData.price).toBe(90);
    });
  });

  describe('Create mode', () => {
    it('resets to empty form when opened without product', () => {
      component.product = null;
      component.isOpen = true;
      component.ngOnChanges({
        isOpen: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
      });

      expect(component.formData.name).toBe('');
      expect(component.formData.description).toBe('');
      expect(component.formData.msrp).toBe(0);
      expect(component.formData.price).toBe(0);
    });
  });

  describe('Validation', () => {
    it('fails when name is empty', () => {
      component.formData = { name: '', description: 'desc', msrp: 10, price: 8 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['name']).toBeTruthy();
    });

    it('fails when name is whitespace only', () => {
      component.formData = { name: '   ', description: 'desc', msrp: 10, price: 8 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['name']).toBeTruthy();
    });

    it('fails when description is empty', () => {
      component.formData = { name: 'Test', description: '', msrp: 10, price: 8 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['description']).toBeTruthy();
    });

    it('fails when MSRP is zero', () => {
      component.formData = { name: 'Test', description: 'desc', msrp: 0, price: 8 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['msrp']).toBeTruthy();
    });

    it('fails when MSRP is negative', () => {
      component.formData = { name: 'Test', description: 'desc', msrp: -5, price: 8 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['msrp']).toBeTruthy();
    });

    it('fails when price is zero', () => {
      component.formData = { name: 'Test', description: 'desc', msrp: 10, price: 0 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['price']).toBeTruthy();
    });

    it('fails when price exceeds MSRP', () => {
      component.formData = { name: 'Test', description: 'desc', msrp: 10, price: 15 };

      expect(component.validate()).toBeFalse();
      expect(component.errors['price']).toContain('cannot exceed MSRP');
    });

    it('passes with valid data', () => {
      component.formData = { name: 'Test', description: 'desc', msrp: 10, price: 8 };

      expect(component.validate()).toBeTrue();
      expect(Object.keys(component.errors).length).toBe(0);
    });

    it('passes when price equals MSRP', () => {
      component.formData = { name: 'Test', description: 'desc', msrp: 10, price: 10 };

      expect(component.validate()).toBeTrue();
    });

    it('clears previous errors on re-validation', () => {
      component.formData = { name: '', description: '', msrp: 0, price: 0 };
      component.validate();

      expect(Object.keys(component.errors).length).toBeGreaterThan(0);

      component.formData = { name: 'Test', description: 'desc', msrp: 10, price: 8 };
      component.validate();

      expect(Object.keys(component.errors).length).toBe(0);
    });
  });

  describe('Form submission', () => {
    it('emits save event with trimmed data when valid', () => {
      spyOn(component.save, 'emit');
      component.formData = { name: '  Test  ', description: '  A description  ', msrp: 10, price: 8 };

      component.onSubmit();

      expect(component.save.emit).toHaveBeenCalledWith({
        name: 'Test',
        description: 'A description',
        msrp: 10,
        price: 8
      });
    });

    it('does not emit save event when invalid', () => {
      spyOn(component.save, 'emit');
      component.formData = { name: '', description: '', msrp: 0, price: 0 };

      component.onSubmit();

      expect(component.save.emit).not.toHaveBeenCalled();
    });

    it('does not emit save event when saving is in progress', () => {
      spyOn(component.save, 'emit');
      component.saving = true;
      component.formData = { name: 'Test', description: 'desc', msrp: 10, price: 8 };

      component.onSubmit();

      expect(component.save.emit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel', () => {
    it('emits cancel event', () => {
      spyOn(component.cancel, 'emit');

      component.onCancel();

      expect(component.cancel.emit).toHaveBeenCalled();
    });
  });

  describe('Reset form', () => {
    it('resets to empty when no product', () => {
      component.product = null;
      component.formData = { name: 'dirty', description: 'dirty', msrp: 99, price: 88 };
      component.errors = { name: 'some error' };

      component.resetForm();

      expect(component.formData.name).toBe('');
      expect(component.errors).toEqual({});
    });

    it('resets to product data when product exists', () => {
      component.product = mockProduct;

      component.resetForm();

      expect(component.formData.name).toBe('Widget');
      expect(component.formData.msrp).toBe(100);
    });
  });

  describe('Template rendering', () => {
    it('does not render modal when closed', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('.modal-backdrop');

      expect(modal).toBeFalsy();
    });

    it('renders modal when open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('.modal-backdrop');

      expect(modal).toBeTruthy();
    });

    it('shows "Add Product" title in create mode', () => {
      component.isOpen = true;
      component.product = null;
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('#product-form-title');

      expect(title?.textContent).toContain('Add Product');
    });

    it('shows "Edit Product" title in edit mode', () => {
      component.isOpen = true;
      component.product = mockProduct;
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('#product-form-title');

      expect(title?.textContent).toContain('Edit Product');
    });

    it('shows "Create" button text in create mode', () => {
      component.isOpen = true;
      component.product = null;
      component.saving = false;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton?.textContent).toContain('Create');
    });

    it('shows "Update" button text in edit mode', () => {
      component.isOpen = true;
      component.product = mockProduct;
      component.saving = false;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton?.textContent).toContain('Update');
    });

    it('shows "Saving..." when saving is in progress', () => {
      component.isOpen = true;
      component.saving = true;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton?.textContent).toContain('Saving...');
    });

    it('disables submit button when saving', () => {
      component.isOpen = true;
      component.saving = true;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton?.disabled).toBeTrue();
    });

    it('has proper ARIA attributes on modal', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('.modal-backdrop');

      expect(modal?.getAttribute('role')).toBe('dialog');
      expect(modal?.getAttribute('aria-modal')).toBe('true');
      expect(modal?.getAttribute('aria-labelledby')).toBe('product-form-title');
    });
  });
});
