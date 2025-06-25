import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductDto, ProductFilter, ProductServiceClient } from '@saanjhi-creation-ui/shared-common';
import { UiButtonComponent, UiFormFieldComponent, UiInputComponent, UiMultiselectComponent } from '@saanjhi-creation-ui/shared-ui';
import { NavigationService } from '../../../services/navigation.service';
// Add the correct import for CarouselModule below. Adjust the path if needed.
import { CarouselModule } from 'primeng/carousel';

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
        CarouselModule
    ],
    templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {

    private readonly navigationService = inject(NavigationService);
    private readonly productClient = inject(ProductServiceClient);
    private readonly fb = inject(FormBuilder);

    form!: FormGroup;
    products: ProductViewModel[] = [];
    totalCount = 0;


    ngOnInit(): void {
        this.form = this.fb.group({
            search: [''],
            categoryId: [''],
            isRentable: [null],
            isActive: [null],
            minPrice: [null],
            maxPrice: [null],
            minRentalPrice: [null],
            maxRentalPrice: [null],
            page: [1],
            pageSize: [12]
        });

        this.loadProducts();
    }

    async loadProducts() {
        const query: ProductFilter = this.form.value;
        const result = await this.productClient.getAll(query);
        this.products = result.items ?? [];
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
        this.navigationService.goToProductCreate();
    }

    onEditClicked(product: ProductViewModel) {
       this.navigationService.goToProductEdit(product.id);
    }

}
