import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    inject,
    input,
    output,
    signal,
    OnInit,
    DestroyRef
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ProductServiceClient,
    ProductDto,
    ProductFilter,
    ToastService
} from '@saanjhi-creation-ui/shared-common';

@Component({
    selector: 'saanjhi-ui-product-select',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        MultiSelectModule
    ],
    template: `
        <!-- Single Select Dropdown -->
        <p-dropdown 
            *ngIf="!multiple()"
            [formControl]="control"
            [options]="products()"
            optionLabel="name"
            optionValue="id"
            [placeholder]="placeholder()"
            [showClear]="showClear()"
            [filter]="filter()"
            filterBy="name,description"
            [loading]="loading()"
            (onFilter)="onSearch($event)"
            (onShow)="onPanelShow()"
            (onHide)="onPanelHide()"
            (onChange)="onSelectionChange($event)"
            class="w-full">
            
            <!-- Custom item template for dropdown -->
            <ng-template pTemplate="item" let-product>
                <div class="flex align-items-center gap-2">
                    <div class="flex flex-column">
                        <span class="font-semibold">{{ product.name || 'Unnamed Product' }}</span>
                        <small class="text-600">
                            {{ getProductSubText(product) }}
                        </small>
                    </div>
                </div>
            </ng-template>
        </p-dropdown>

        <!-- Multi Select Dropdown -->
        <p-multiSelect
            *ngIf="multiple()"
            [formControl]="control"
            [options]="products()"
            optionLabel="name"
            optionValue="id"
            [placeholder]="placeholder()"
            [showClear]="showClear()"
            [filter]="filter()"
            filterBy="name,description"
            [maxSelectedLabels]="maxSelectedLabels()"
            [selectedItemsLabel]="selectedItemsLabel()"
            [virtualScroll]="virtualScroll()"
            [virtualScrollItemSize]="virtualScrollItemSize()"
            [loading]="loading()"
            (onFilter)="onSearch($event)"
            (onShow)="onPanelShow()"
            (onHide)="onPanelHide()"
            (onChange)="onSelectionChange($event)"
            class="w-full">
            
            <!-- Custom item template for multiselect -->
            <ng-template pTemplate="item" let-product>
                <div class="flex align-items-center gap-2">
                    <div class="flex flex-column">
                        <span class="font-semibold">{{ product.name || 'Unnamed Product' }}</span>
                        <small class="text-600">
                            {{ getProductSubText(product) }}
                        </small>
                    </div>
                </div>
            </ng-template>

            <!-- Loading template -->
            <ng-template pTemplate="loader" *ngIf="loading()">
                <div class="flex align-items-center p-2">
                    <i class="pi pi-spin pi-spinner mr-2"></i>
                    <span>Loading products...</span>
                </div>
            </ng-template>
        </p-multiSelect>
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

    // Input properties
    multiple = input<boolean>(false);
    placeholder = input<string>('Select product...');
    showClear = input<boolean>(true);
    filter = input<boolean>(true);
    pageSize = input<number>(25);

    // Multi-select specific properties
    maxSelectedLabels = input<number>(2);
    selectedItemsLabel = input<string>('{0} products selected');
    virtualScroll = input<boolean>(false); // ✅ Disabled virtual scroll for consistency
    virtualScrollItemSize = input<number>(43);

    // ✅ Output events
    productSelected = output<ProductDto | ProductDto[] | null>();
    productChanged = output<{ value: any, product: ProductDto | ProductDto[] | null }>();

    // Internal state
    products = signal<ProductDto[]>([]);
    loading = signal<boolean>(false);
    control = new FormControl({ value: null, disabled: false });

    // Pagination state
    private currentPage = 1;
    private currentSearchTerm = '';
    private hasMorePages = true;

    // ControlValueAccessor implementation
    private onChange = (value: any) => { };
    private onTouched = () => { };

    ngOnInit() {
        // Subscribe to control value changes
        this.control.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                this.onChange(value);
                this.onTouched();
            });

        // Load initial data
        this.loadProducts(true);
    }

    writeValue(value: any): void {
        this.control.setValue(value, { emitEvent: false });
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

    // ✅ Handle selection changes and emit events
    onSelectionChange(event: any) {
        const selectedValue = event.value;

        if (selectedValue) {
            // Find the selected product(s) from the options
            const allProducts = this.products();

            if (this.multiple()) {
                // Multi-select: find all selected products
                const selectedProducts = allProducts.filter(product =>
                    Array.isArray(selectedValue) ? selectedValue.includes(product.id) : false
                );
                this.productSelected.emit(selectedProducts);
                this.productChanged.emit({ value: selectedValue, product: selectedProducts });
            } else {
                // Single select: find the selected product
                const selectedProduct = allProducts.find(product => product.id === selectedValue);
                this.productSelected.emit(selectedProduct || null);
                this.productChanged.emit({ value: selectedValue, product: selectedProduct || null });
            }
        } else {
            // No selection or cleared
            this.productSelected.emit(null);
            this.productChanged.emit({ value: null, product: null });
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
        this.currentSearchTerm = search;

        try {
            const query: ProductFilter = {
                page: this.currentPage,
                pageSize: this.pageSize(),
                sortBy: 'name',
                sortDesc: false
            };

            // Add search filter
            if (search.trim()) {
                query.search = search.trim();
            }

            const result = await this.productClient.getAll(query);
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
        const query = event.filter || '';
        this.loadProducts(true, query);
    }

    // Panel show handler
    onPanelShow() {
        // Reset and load fresh data when panel opens
        this.loadProducts(true, '');
    }

    // Panel hide handler
    onPanelHide() {
        // Optional: cleanup or reset if needed
    }

    // Get product subtitle text
    getProductSubText(product: ProductDto): string {
        const parts = [];
        if (product.categoryName) parts.push(product.categoryName);
        if (product.rentalPrice) parts.push(`$${product.rentalPrice}`);
        return parts.join(' • ') || 'No additional info';
    }
}