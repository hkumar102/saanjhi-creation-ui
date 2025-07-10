import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    UiButtonComponent,
    UiDropdownComponent,
    UiFormFieldComponent,
    UiInputComponent,
    ProductCardComponent,
    CategorySelectComponent
} from '@saanjhi-creation-ui/shared-ui';
import {
    CategoryDto,
    CategoryServiceClient,
    ProductDto,
    ProductFilter,
    ProductServiceClient} from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { Card } from "primeng/card";

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiButtonComponent,
        UiDropdownComponent,
        UiFormFieldComponent,
        UiInputComponent,
        ProductCardComponent,
        CategorySelectComponent,
        Card
    ],
    templateUrl: './product-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent extends AdminBaseComponent implements OnInit {
    private readonly productClient = inject(ProductServiceClient);
    private readonly categoryClient = inject(CategoryServiceClient);
    private readonly fb = inject(FormBuilder);

    products = signal<ProductDto[]>([]);
    categories = signal<CategoryDto[]>([]);
    loading = signal(false);

    form: FormGroup = this.fb.group({
        search: [{ value: '', disabled: false }],
        categoryIds: [{ value: null, disabled: false }],
        customerIds: [{ value: null, disabled: false }],
        isRentable: [{ value: null, disabled: false }],
        isActive: [{ value: null, disabled: false }],
    });

    private currentPage = 1;
    private pageSize = 20;
    private hasMoreProducts = true;

    async ngOnInit() {
        await this.loadProducts();
    }

    async loadProducts(reset: boolean = false) {
        if (reset) {
            this.currentPage = 1;
            this.products.set([]);
            this.hasMoreProducts = true;
        }

        if (!this.hasMoreProducts) {
            return;
        }

        this.loading.set(true);

        try {
            const formValue = this.form.value;
            const filter: ProductFilter = {
                page: this.currentPage,
                pageSize: this.pageSize,
                search: formValue.search || undefined,
                categoryIds: formValue.categoryIds?.length ? formValue.categoryIds : undefined,
                isRentable: formValue.isRentable !== null ? formValue.isRentable : undefined,
                isActive: formValue.isActive !== null ? formValue.isActive : undefined,
            };

            const result = await this.productClient.getAll(filter);
            const newProducts = result.items || [];

            if (reset) {
                this.products.set(newProducts);
            } else {
                this.products.set([...this.products(), ...newProducts]);
            }

            this.hasMoreProducts = newProducts.length === this.pageSize;
            this.currentPage++;
        } catch (error) {
            this.toast.error('Failed to load products');
        } finally {
            this.loading.set(false);
        }
    }

    onFilterChange() {
        this.loadProducts(true);
    }

    onClearFilters() {
        this.form.reset({
            search: '',
            categoryIds: null,
            customerIds: null,
            isRentable: null,
            isActive: null,
        });
        this.loadProducts(true);
    }

    onLoadMore() {
        if (!this.loading() && this.hasMoreProducts) {
            this.loadProducts();
        }
    }

    onAddProduct() {
        this.navigation.goToProductCreate();
    }

    onEditClicked(product: ProductDto) {
        this.navigation.goToProductEdit(product.id);
    }

    onPreviewProduct(product: ProductDto) {
        this.navigation.goToProductDetails(product.id);
    }
}
