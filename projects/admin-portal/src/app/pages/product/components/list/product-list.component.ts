import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductServiceClient, ProductDto, GetAllProductsQuery, ProductDtoPaginatedResult, AppCurrencyPipe, CategoryServiceClient, CategoryDto, AvailableColors, AvailableSizes, ProductFilterEvent, ProductActiveFilter } from '@saanjhi-creation-ui/shared-common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { UiConfirmDialogComponent, UiAutocompleteComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../../../common/components/base/admin-base.component';
import { RouterModule } from '@angular/router';
import { ProductWorkflowService } from '../../services/product-workflow.service';
import { ProductFilterComponent } from "./product-filter/product-filter.component";
import { ProductCardComponent } from "./product-card/product-card.component";
import { DropdownModule } from "primeng/dropdown";
import { Badge } from "primeng/badge";
import { IInfiniteScrollEvent, InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RouterModule,
    UiConfirmDialogComponent,
    RouterModule,
    ProductFilterComponent,
    ProductCardComponent,
    DropdownModule,
    Badge,
    InfiniteScrollDirective
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends AdminBaseComponent implements OnInit {
  private productService = inject(ProductServiceClient);
  private categoryService = inject(CategoryServiceClient);
  private workflowService = inject(ProductWorkflowService);

  @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;


  categories: CategoryDto[] = [];
  colors = AvailableColors.map(c => c.name);
  sizes = AvailableSizes;
  products: ProductDto[] = [];
  totalCount = 0;
  isLoading = false;
  query: Partial<GetAllProductsQuery> = {};
  pageSize = 50;
  pageNumber = 1;
  activeFilters: ProductActiveFilter[] = [];


  async ngOnInit() {
    this.categories = (await this.categoryService.getAll()).items;
  }

  async loadProducts() {
    this.isLoading = true;
    try {
      this.query.pageSize = this.pageSize;
      this.query.page = this.pageNumber;
      const result: ProductDtoPaginatedResult = await this.productService.search(this.query as GetAllProductsQuery);
      this.products.push(...(result.items || []));
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

  onScroll() {
    if (this.isLoading || this.products.length >= this.totalCount) return;
    this.pageNumber++;
    this.loadProducts();
  }

  onSort(event: any) {
    this.query.sortBy = event.field;
    this.query.sortDesc = event.order === -1;
    this.loadProducts();
  }

  onFiltersChanged(filters: ProductFilterEvent) {
    this.query = filters.query;
    this.activeFilters = filters.activeFilters;
    console.log('Filters changed:', filters.activeFilters);
    this.resetList();
    this.loadProducts();
  }

  resetList() {
    this.pageNumber = 1;
    this.products = [];
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