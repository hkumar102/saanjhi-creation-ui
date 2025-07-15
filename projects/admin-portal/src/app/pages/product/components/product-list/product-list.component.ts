import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductServiceClient, ProductDto, GetAllProductsQuery, ProductDtoPaginatedResult, AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CategorySelectComponent, UiFormControlComponent, UiInputComponent, UiConfirmDialogComponent } from '@saanjhi-creation-ui/shared-ui';
import { takeUntil } from 'rxjs';
import { AdminBaseComponent } from '../../../../common/components/base/admin-base.component';
import { Card } from "primeng/card";
import { RouterModule } from '@angular/router';
import { ProductWorkflowService } from '../../services/product-workflow.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    UiFormControlComponent,
    CategorySelectComponent,
    UiInputComponent,
    AppCurrencyPipe,
    Card,
    RouterModule,
    UiConfirmDialogComponent,
    RouterModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends AdminBaseComponent implements OnInit {
  private productService = inject(ProductServiceClient);
  private workflowService = inject(ProductWorkflowService);
  private fb = inject(FormBuilder);

  @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;
  filterForm: FormGroup = this.fb.group({
    search: [''],
    categoryIds: [[]],
    isActive: [undefined],
    isRentable: [undefined],
    isPurchasable: [undefined]
  });

  categories = [{
    "id": "f36f0952-4623-44a7-91f4-14b01e74ae52",
    "name": "Drape Saree",
    "description": "Drape Saree",
    "createdAt": "2025-02-09T15:58:14.774029Z",
    "updatedAt": null
  },
  {
    "id": "65447ba5-c42a-42a2-a7ac-4b9c1cca181f",
    "name": "Fish Cut",
    "description": "Fish Cut",
    "createdAt": "2025-02-09T15:59:38.706886Z",
    "updatedAt": null
  },
  {
    "id": "102807d2-969d-4c6d-9877-de42ed20acf7",
    "name": "Gowns",
    "description": "Gowns",
    "createdAt": "2025-02-09T15:57:26.162734Z",
    "updatedAt": null
  },
  {
    "id": "b2b5f3d8-4531-47eb-b4b2-40a86552b2df",
    "name": "Indo Western",
    "description": "Indo Western",
    "createdAt": "2025-02-09T15:59:08.337908Z",
    "updatedAt": null
  },
  {
    "id": "c4a8db36-458c-49df-b897-efe710e019bc",
    "name": "Lehenga",
    "description": "All Type of Lehengas",
    "createdAt": "2025-02-08T05:54:29.673412Z",
    "updatedAt": null
  }];

  products: ProductDto[] = [];
  totalCount = 0;
  isLoading = false;

  query: GetAllProductsQuery = {
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDesc: true,
    includeMedia: true,
    includeInventory: true,
    organizeMediaByColor: false
  };

  ngOnInit() {
    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onFilterChange();
    });
  }

  async loadProducts() {
    this.isLoading = true;
    try {
      const filters = this.filterForm.value;
      const result: ProductDtoPaginatedResult = await this.productService.search({
        ...this.query,
        ...filters
      });
      this.products = result.items || [];
      this.totalCount = result.totalCount;
    } finally {
      this.isLoading = false;
    }
  }

  onPageChange(event: any) {
    this.query.page = event.first + 1;
    this.query.pageSize = event.rows;
    this.loadProducts();
  }

  onSort(event: any) {
    this.query.sortBy = event.field;
    this.query.sortDesc = event.order === -1;
    this.loadProducts();
  }

  onFilterChange() {
    this.query.page = 1;
    this.loadProducts();
  }

  editProduct(product: ProductDto) {
    // Implement navigation to edit page
  }

  deleteProduct(product: ProductDto) {
    this.confirmDialog.open({
      message: this.formatter.format(this.ConfirmationMessages.deleteConfirmation, product.name),
      accept: async () => {
        try {
          await this.productService.delete(product.id);
          this.toast.success(this.formatter.format(this.ConfirmationMessages.deleteSuccess, product.name));
          await this.loadProducts();
        } catch (error) {
          this.toast.error(this.formatter.format(this.ConfirmationMessages.deleteFailed, product.name));
        }
      }
    });
  }

  onCreateProduct() {
    this.workflowService.resetWorkflow();
    this.navigation.goToProductCreate();
  }
}