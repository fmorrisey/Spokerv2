import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ProductComponents } from '../../../../../swagger';

type Product = ProductComponents['schemas']['Product'];

export interface ProductFormData {
  name: string;
  description: string;
  msrp: number;
  price: number;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Input() isOpen = false;
  @Input() saving = false;
  @Output() save = new EventEmitter<ProductFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: ProductFormData = {
    name: '',
    description: '',
    msrp: 0,
    price: 0,
  };

  errors: Partial<Record<keyof ProductFormData, string>> = {};

  get isEditMode(): boolean {
    return this.product !== null;
  }

  get title(): string {
    return this.isEditMode ? 'Edit Product' : 'Add Product';
  }

  ngOnChanges(changes: SimpleChanges): void {
    const openedNow = !!changes['isOpen'] && this.isOpen;
    const productChangedWhileOpen = !!changes['product'] && this.isOpen;

    if (openedNow || productChangedWhileOpen) {
      this.resetForm();
    }
  }

  resetForm(): void {
    if (this.product) {
      this.formData = {
        name: this.product.name,
        description: this.product.description,
        msrp: this.product.msrp,
        price: this.product.price,
      };
    } else {
      this.formData = { name: '', description: '', msrp: 0, price: 0 };
    }
    this.errors = {};
  }

  validate(): boolean {
    this.errors = {};

    if (!this.formData.name.trim()) {
      this.errors['name'] = 'Name is required';
    }

    if (!this.formData.description.trim()) {
      this.errors['description'] = 'Description is required';
    }

    if (this.formData.msrp <= 0) {
      this.errors['msrp'] = 'MSRP must be greater than zero';
    }

    if (this.formData.price <= 0) {
      this.errors['price'] = 'Price must be greater than zero';
    } else if (this.formData.msrp > 0 && this.formData.price > this.formData.msrp) {
      this.errors['price'] = 'Price cannot exceed MSRP';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (this.saving) return;
    if (!this.validate()) return;

    this.save.emit({
      name: this.formData.name.trim(),
      description: this.formData.description.trim(),
      msrp: this.formData.msrp,
      price: this.formData.price,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
