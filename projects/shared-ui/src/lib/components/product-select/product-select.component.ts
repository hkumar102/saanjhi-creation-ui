import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    inject,
    input,
    output,
    signal,
    OnInit,
    DestroyRef,
    ChangeDetectorRef
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    ProductServiceClient,
    ProductDto,
    GetAllProductsQuery,
    ToastService
} from '@saanjhi-creation-ui/shared-common';
import { UiAutocompleteComponent } from '@saanjhi-creation-ui/shared-ui';

// To use template this is what we can do
//             <ng-template #header>
//                 <div class="font-medium px-3 py-2">Available Products</div>
//             </ng-template>
//             <ng-template let-country #item>
//                 <div class="flex items-center gap-2">
//                     <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + country.code.toLowerCase()" style="width: 18px" />
//                     <div>{{ country.name }}</div>
//                 </div>
//             </ng-template>
//             <ng-template #footer>
//                 <div class="px-3 py-3">
//             <p-button label="Add New" fluid severity="secondary" text size="small" icon="pi pi-plus" />
//                 </div>
//             </ng-template> 

@Component({
    selector: 'saanjhi-ui-product-select',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiAutocompleteComponent
    ],
    template: `
        <!-- Single Select Dropdown -->
         <saanjhi-ui-autocomplete 
            [formControl]="control" 
            optionLabel="name" 
            optionValue="id" 
            [suggestions]="products()" 
            [dropdown]="true" 
            [multiple]="multiple()"
            [forceSelection]="true"
            (completeMethod)="onSearch($event)"
            (onSelect)="handleAutoCompleteSelect($event)"
            (onUnselect)="handleAutoCompleteSelect($event)"
            [placeholder]="placeholder()"
            styleClass="w-full">
             <ng-template let-product #item>
                <div class="flex items-center gap-2">
                    <img [src]="product.mainImage ? product.mainImage.url : 'assets/images/default-product.svg'" style="width: 18px" />
                    <div>{{ product.categoryName }}</div>
                    <div>{{ product.name }}</div>
                </div>
            </ng-template>
        </saanjhi-ui-autocomplete>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ProductSelectComponent),
            multi: true
        }
    ]
})
export class ProductSelectComponent implements ControlValueAccessor, OnInit {
    private productClient = inject(ProductServiceClient);
    private toast = inject(ToastService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    // Input properties
    multiple = input<boolean>(false);
    placeholder = input<string>('Select product...');
    showClear = input<boolean>(true);
    filter = input<boolean>(true);
    pageSize = input<number>(25);


    // Output events
    productSelected = output<ProductDto | ProductDto[] | null>();

    // Internal state
    products = signal<ProductDto[]>([]);
    loading = signal<boolean>(false);
    control = new FormControl({ value: null, disabled: false });

    // Pagination state
    private currentPage = 1;
    private hasMorePages = true;

    // ControlValueAccessor implementation
    private onChange = (value: any) => { };
    private onTouched = () => { };

    async ngOnInit() {
    }

    async writeValue(value: any) {
        if (value) {
            let productIds: string[] = [];
            if (Array.isArray(value)) {
                productIds = value;
            } else {
                productIds = [value];
            }

            if (this.hasProductsLoaded(productIds)) {
                this.control.setValue(value);
            } else {
                await this.loadProductsByIds(productIds);
                this.control.setValue(value);
            }
        } else {
            this.control.setValue(null);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable({ emitEvent: false });
        } else {
            this.control.enable({ emitEvent: false });
        }
    }

    // Load products with pagination and search
    async loadProducts(reset: boolean = false, search: string = '') {
        if (reset) {
            this.currentPage = 1;
            this.products.set([]);
            this.hasMorePages = true;
        }

        if (!this.hasMorePages && !reset) {
            return;
        }

        this.loading.set(true);

        try {
            const query: GetAllProductsQuery = {
                page: this.currentPage,
                pageSize: this.pageSize(),
                sortBy: 'name',
                sortDesc: false,
                includeInventory: false,
                includeMedia: false,
                organizeMediaByColor: false,
            };

            // Add search filter
            if (search.trim()) {
                query.search = search.trim();
            }

            const result = await this.productClient.search(query);
            const newItems = result.items || [];

            if (reset) {
                this.products.set(newItems);
            } else {
                // Append new items for pagination
                const currentProducts = this.products();
                this.products.set([...currentProducts, ...newItems]);
            }

            // Check if there are more pages
            this.hasMorePages = newItems.length === this.pageSize();
            this.currentPage++;

        } catch (error) {
            this.toast.error('Failed to load products');
        } finally {
            this.loading.set(false);
        }
    }

    // Search handler
    onSearch(event: any) {
        const query = event.query || '';
        this.loadProducts(true, query);
    }

    // Get product subtitle text
    getProductSubText(product: ProductDto): string {
        const parts = [];
        if (product.categoryName) parts.push(product.categoryName);
        if (product.rentalPrice) parts.push(`$${product.rentalPrice}`);
        return parts.join(' • ') || 'No additional info';
    }

    // ✅ Load multiple products by IDs for multi-select
    async loadProductsByIds(productIds: string[]): Promise<void> {
        if (!productIds?.length) return;

        this.loading.set(true);
        try {
            const loadedProducts: ProductDto[] = [];

            for (const id of productIds) {
                try {
                    const product = await this.productClient.getById(id);
                    if (product) {
                        loadedProducts.push(product);
                    }
                } catch (error) {
                    console.warn(`Failed to load product ${id}:`, error);
                }
            }

            // Update products list
            const existingProducts = this.products();
            const mergedProducts = [...existingProducts];

            loadedProducts.forEach(product => {
                const exists = mergedProducts.find(p => p.id === product.id);
                if (!exists) {
                    mergedProducts.push(product);
                }
            });

            this.products.set(mergedProducts);

        } catch (error) {
            console.error('Error loading products by IDs:', error);
        } finally {
            this.loading.set(false);
        }
    }

    handleAutoCompleteSelect(event: ProductDto | ProductDto[]) {
        this.productSelected.emit(event);
        if (event) {
            if (this.multiple()) {
                this.onChange((event as ProductDto[]).map(p => p.id));
            } else {
                this.onChange((event as ProductDto).id);
            }
        }
    }

    hasProductsLoaded(productIds: string[]): boolean {
        const loadedProductIds = this.products().map(p => p.id);
        return productIds.every(id => loadedProductIds.includes(id));
    }
}