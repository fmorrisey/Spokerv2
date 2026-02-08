import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product/product.service';
import { ProductFormComponent, ProductFormData } from './product-form/product-form.component';
import type { ProductComponents } from '../../../../swagger';

type Product = ProductComponents['schemas']['Product'];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);

  // Delete modal state
  isDeleteModalOpen = false;
  deleteCandidate: { id: string; name: string } | null = null;

  // Form modal state
  isFormOpen = false;
  formSaving = false;
  editingProduct: Product | null = null;

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    await this.productService.getAll();
  }

  // --- Create ---

  openCreateForm() {
    this.editingProduct = null;
    this.isFormOpen = true;
  }

  // --- Edit ---

  openEditForm(product: Product) {
    this.editingProduct = product;
    this.isFormOpen = true;
  }

  // --- Form save (handles both create and edit) ---

  async onFormSave(formData: ProductFormData) {
    this.formSaving = true;

    if (this.editingProduct?._id) {
      const result = await this.productService.update(this.editingProduct._id, formData);
      if (result) {
        this.closeForm();
      }
    } else {
      const result = await this.productService.create(formData);
      if (result) {
        this.closeForm();
      }
    }

    this.formSaving = false;
  }

  closeForm() {
    this.isFormOpen = false;
    this.editingProduct = null;
    this.formSaving = false;
  }

  // --- Delete ---

  openDeleteConfirm(id: string | undefined, name: string) {
    if (!id) return;
    this.deleteCandidate = { id, name };
    this.isDeleteModalOpen = true;
  }

  closeDeleteConfirm() {
    this.isDeleteModalOpen = false;
    this.deleteCandidate = null;
  }

  async confirmDelete() {
    if (!this.deleteCandidate) return;
    await this.productService.delete(this.deleteCandidate.id);
    this.closeDeleteConfirm();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
