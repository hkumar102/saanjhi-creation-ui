import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryDto, CategoryServiceClient, ProductDto, ProductFilter, ProductServiceClient } from '@saanjhi-creation-ui/shared-common';
import { ProductCardComponent, UiButtonComponent, UiDropdownComponent, UiFormFieldComponent, UiInputComponent, UiMultiselectComponent, UiCardComponent } from '@saanjhi-creation-ui/shared-ui';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

type ProductViewModel = ProductDto & { selectedImage?: string };

@Component({
    standalone: true,
    selector: 'app-product-list',
    imports: [
    CommonModule,
    UiInputComponent,
    UiButtonComponent,
    UiFormFieldComponent,
    UiMultiselectComponent,
    ReactiveFormsModule,
    ProductCardComponent,
    UiDropdownComponent,
    UiCardComponent,
    UiCardComponent
],
    templateUrl: './product-list.component.html',
})
export class ProductListComponent extends AdminBaseComponent implements OnInit {
    private readonly productClient = inject(ProductServiceClient);
    private readonly fb = inject(FormBuilder);
    private categoryService = inject(CategoryServiceClient);

    form: FormGroup = this.fb.group({
        search: [''],
        categoryId: [''],
        isRentable: [null],
        isActive: [null],
        minPrice: [null],
        maxPrice: [null],
        minRentalPrice: [null],
        maxRentalPrice: [null],
        page: [1],
        pageSize: [20]
    });
    products: ProductViewModel[] = [];
    totalCount = 0;
    categories: CategoryDto[] = [];

    async ngOnInit() {
        await this.loadProducts();
        await this.loadCategories();
    }

    async loadCategories() {
        const res = await this.categoryService.getAll();
        this.categories = res;
    }

    async loadProducts() {
        const query: ProductFilter = this.form.value;
        const result = await this.productClient.getAll(query);

        if (this.form.value.page > 1) {
            this.products = [...this.products, ...(result.items ?? [])];
        } else {
            this.products = result.items ?? [];
        }
        this.totalCount = result.totalCount;
    }

    onFilterChange() {
        this.form.patchValue({ page: 1 });
        this.loadProducts();
    }

    onPageChange(page: number) {
        this.form.patchValue({ page });
        this.loadProducts();
    }

    onAddProduct() {
        this.navigation.goToProductCreate();
    }

    onEditClicked(product: ProductDto) {
        this.navigation.goToProductEdit(product.id);
    }

    onScroll(event: Event) {
        const el = event.target as HTMLElement;
        const threshold = 200;

        if (el.scrollTop + el.clientHeight + threshold >= el.scrollHeight) {
            const nextPage = this.form.value.page + 1;
            this.form.patchValue({ page: nextPage });
            this.loadProducts();
        }
    }

    onLoadMore() {
        const currentPage = this.form.value.page ?? 1;
        const nextPage = currentPage + 1;
        this.form.patchValue({ page: nextPage });
        this.loadProducts();
    }

    onClearFilters(): void {
        this.form.reset({
            search: '',
            categoryId: null,
            minPrice: null,
            maxPrice: null,
            isRentable: null,
            isActive: null,
            minRentalPrice: null,
            maxRentalPrice: null,
            page: 1,
            pageSize: 20
        });

        this.loadProducts();
    }

    onPreviewProduct(product: ProductDto) {
        this.navigation.goToProductDetails(product.id);
    }
}
