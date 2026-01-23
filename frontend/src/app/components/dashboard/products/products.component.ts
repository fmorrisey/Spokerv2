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

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    await this.productService.getAll();
  }

  async deleteProduct(id: string | undefined) {
    if (!id) return;
    
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (confirmed) {
      await this.productService.delete(id);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}