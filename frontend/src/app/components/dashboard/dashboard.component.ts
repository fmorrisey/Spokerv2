import { Component } from '@angular/core';
import { ProductsComponent } from "./products/products.component";

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [ProductsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

}
