#!/bin/bash

set -e

BASE_DIR="projects/admin-portal/src/app/pages/product"
mkdir -p "$BASE_DIR"

# 1. Product List
cat <<EOF > "$BASE_DIR/product-list.component.ts"
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductServiceClient, ProductDto, ProductFilter } from 'shared-common/src/lib/http-clients/product.service.client';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  private readonly service = inject(ProductServiceClient);
  products: ProductDto[] = [];
  filter: ProductFilter = { Page: 1, PageSize: 10 };

  async load() {
    const res = await this.service.getAll(this.filter);
    this.products = res.items ?? [];
  }

  ngOnInit() {
    this.load();
  }
}
EOF

cat <<EOF > "$BASE_DIR/product-list.component.html"
<h2>Products</h2>
<input [(ngModel)]="filter.Search" placeholder="Search..." />
<button (click)="load()">Search</button>
<a routerLink="/products/create">Create</a>
<ul>
  <li *ngFor="let product of products">
    {{ product.name }} - ₹{{ product.price }}
    <a [routerLink]="['/products', product.id, 'edit']">Edit</a>
  </li>
</ul>
EOF

# 2. Product Form
cat <<EOF > "$BASE_DIR/product-form.component.ts"
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateProductCommand } from 'shared-common/src/lib/http-clients/product.service.client';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
  @Input() model: CreateProductCommand = {
    name: '',
    price: 0,
    quantity: 1,
    isActive: true,
    isRentable: false,
    categoryId: ''
  };
  @Output() submit = new EventEmitter<CreateProductCommand>();
}
EOF

cat <<EOF > "$BASE_DIR/product-form.component.html"
<form (ngSubmit)="submit.emit(model)">
  <label>Name: <input [(ngModel)]="model.name" name="name" /></label><br />
  <label>Price: <input type="number" [(ngModel)]="model.price" name="price" /></label><br />
  <label>Quantity: <input type="number" [(ngModel)]="model.quantity" name="quantity" /></label><br />
  <label>Category ID: <input [(ngModel)]="model.categoryId" name="categoryId" /></label><br />
  <label><input type="checkbox" [(ngModel)]="model.isActive" name="isActive" /> Active</label><br />
  <label><input type="checkbox" [(ngModel)]="model.isRentable" name="isRentable" /> Rentable</label><br />
  <button type="submit">Save</button>
</form>
EOF

# 3. Product Create
cat <<EOF > "$BASE_DIR/product-create.component.ts"
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductServiceClient } from 'shared-common/src/lib/http-clients/product.service.client';
import { ProductFormComponent } from './product-form.component';

@Component({
  standalone: true,
  selector: 'app-product-create',
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent {
  private readonly service = inject(ProductServiceClient);
  private readonly router = inject(Router);

  async create(data: any) {
    await this.service.create(data);
    this.router.navigate(['/products']);
  }
}
EOF

cat <<EOF > "$BASE_DIR/product-create.component.html"
<app-product-form (submit)="create($event)" />
EOF

# 4. Product Edit
cat <<EOF > "$BASE_DIR/product-edit.component.ts"
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductServiceClient, UpdateProductCommand } from 'shared-common/src/lib/http-clients/product.service.client';
import { ProductFormComponent } from './product-form.component';

@Component({
  standalone: true,
  selector: 'app-product-edit',
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-edit.component.html'
})
export class ProductEditComponent {
  private readonly service = inject(ProductServiceClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  model!: UpdateProductCommand;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const product = await this.service.getById(id);
    this.model = { ...product };
  }

  async update(data: UpdateProductCommand) {
    await this.service.update(data.id, data);
    this.router.navigate(['/products']);
  }
}
EOF

cat <<EOF > "$BASE_DIR/product-edit.component.html"
<app-product-form [model]="model" (submit)="update($event)" *ngIf="model" />
EOF

echo "✅ Product CRUD components generated in: $BASE_DIR"
