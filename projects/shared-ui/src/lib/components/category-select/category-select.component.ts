import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    inject,
    input,
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
    CategoryServiceClient,
    CategoryDto,
    GetAllCategoriesQuery,
    ToastService
} from '@saanjhi-creation-ui/shared-common';

@Component({
    selector: 'saanjhi-ui-category-select',
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
            [options]="categories()"
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
            class="w-full">
            
            <!-- Custom item template for dropdown -->
            <ng-template pTemplate="item" let-category>
                <div class="flex align-items-center gap-2">
                    <div class="flex flex-column">
                        <span class="font-semibold">{{ category.name || 'Unknown Category' }}</span>
                        <small class="text-600" *ngIf="category.description">
                            {{ category.description }}
                        </small>
                    </div>
                </div>
            </ng-template>
        </p-dropdown>

        <!-- Multi Select Dropdown -->
        <p-multiSelect
            *ngIf="multiple()"
            [formControl]="control"
            [options]="categories()"
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
            (onPanelShow)="onPanelShow()"
            (onPanelHide)="onPanelHide()"
            class="w-full">
            
            <!-- Custom item template for multiselect -->
            <ng-template pTemplate="item" let-category>
                <div class="flex align-items-center gap-2">
                    <div class="flex flex-column">
                        <span class="font-semibold">{{ category.name || 'Unknown Category' }}</span>
                        <small class="text-600" *ngIf="category.description">
                            {{ category.description }}
                        </small>
                    </div>
                </div>
            </ng-template>

            <!-- Loading template -->
            <ng-template pTemplate="loader" *ngIf="loading()">
                <div class="flex align-items-center p-2">
                    <i class="pi pi-spin pi-spinner mr-2"></i>
                    <span>Loading categories...</span>
                </div>
            </ng-template>
            
        </p-multiSelect>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CategorySelectComponent),
            multi: true
        }
    ]
})
export class CategorySelectComponent implements ControlValueAccessor, OnInit {
    private categoryClient = inject(CategoryServiceClient);
    private toast = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    // Input properties
    multiple = input<boolean>(false);
    placeholder = input<string>('Select category...');
    showClear = input<boolean>(true);
    filter = input<boolean>(true);
    pageSize = input<number>(100);

    // Multi-select specific properties
    maxSelectedLabels = input<number>(2);
    selectedItemsLabel = input<string>('{0} categories selected');
    virtualScroll = input<boolean>(false);
    virtualScrollItemSize = input<number>(43);

    // Internal state
    categories = signal<CategoryDto[]>([]);
    loading = signal<boolean>(false);
    control = new FormControl({ value: null, disabled: false }); // ✅ Initialize with disabled state

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
        this.loadCategories(true);
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
        // ✅ Use FormControl methods to handle disabled state
        if (isDisabled) {
            this.control.disable({ emitEvent: false });
        } else {
            this.control.enable({ emitEvent: false });
        }
    }

    // Load categories with pagination and search
    async loadCategories(reset: boolean = false, search: string = '') {
        if (reset) {
            this.currentPage = 1;
            this.categories.set([]);
            this.hasMorePages = true;
        }

        if (!this.hasMorePages && !reset) {
            return;
        }

        this.loading.set(true);
        this.currentSearchTerm = search;

        try {
            const query: GetAllCategoriesQuery = {
                page: this.currentPage,
                pageSize: this.pageSize(),
                sortBy: 'name',
                sortDesc: false
            };

            // Add search filter
            if (search.trim()) {
                query.search = search.trim();
            }

            const result = await this.categoryClient.getAll(query);
            const newItems = result.items || [];
            if (reset) {
                this.categories.set(newItems);
            } else {
                // Append new items for pagination
                const currentCategories = this.categories();
                this.categories.set([...currentCategories, ...newItems]);
            }

            // Check if there are more pages
            this.hasMorePages = newItems.length === this.pageSize();
            this.currentPage++;

        } catch (error) {
            this.toast.error('Failed to load categories');
        } finally {
            this.loading.set(false);
        }
    }

    // Search handler
    onSearch(event: any) {
        const query = event.filter || '';
        this.loadCategories(true, query);
    }

    // Panel show handler
    onPanelShow() {
        // Reset and load fresh data when panel opens
        this.loadCategories(true, '');
    }

    // Panel hide handler
    onPanelHide() {
        // Optional: cleanup or reset if needed
    }
}