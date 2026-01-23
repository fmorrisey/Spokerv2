import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  isDeleteModalOpen = false;
  deleteCandidate: { id: string; name: string } | null = null;

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    await this.productService.getAll();
  }

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
