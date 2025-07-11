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
    CustomerServiceClient,
    CustomerDto,
    GetCustomersQuery,
    ToastService
} from '@saanjhi-creation-ui/shared-common';

@Component({
    selector: 'saanjhi-ui-customer-select',
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
            [options]="customers()"
            optionLabel="name"
            optionValue="id"
            [placeholder]="placeholder()"
            [showClear]="showClear()"
            [filter]="filter()"
            filterBy="name,email,phoneNumber"
            [loading]="loading()"
            (onFilter)="onSearch($event)"
            (onShow)="onPanelShow()"
            (onHide)="onPanelHide()"
            (onChange)="onSelectionChange($event)"
            class="w-full">
            
            <!-- Custom item template for dropdown -->
            <ng-template pTemplate="item" let-customer>
                <div class="flex align-items-center gap-2">
                    <div class="flex flex-column">
                        <span class="font-semibold">{{ customer.name || 'Unknown' }}</span>
                        <small class="text-600">
                            {{ getCustomerSubText(customer) }}
                        </small>
                    </div>
                </div>
            </ng-template>
        </p-dropdown>

        <!-- Multi Select Dropdown -->
        <p-multiSelect
            *ngIf="multiple()"
            [formControl]="control"
            [options]="customers()"
            optionLabel="name"
            optionValue="id"
            [placeholder]="placeholder()"
            [showClear]="showClear()"
            [filter]="filter()"
            filterBy="name,email,phoneNumber"
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
            <ng-template pTemplate="item" let-customer>
                <div class="flex align-items-center gap-2">
                    <div class="flex flex-column">
                        <span class="font-semibold">{{ customer.name || 'Unknown' }}</span>
                        <small class="text-600">
                            {{ getCustomerSubText(customer) }}
                        </small>
                    </div>
                </div>
            </ng-template>

            <!-- Loading template -->
            <ng-template pTemplate="loader" *ngIf="loading()">
                <div class="flex align-items-center p-2">
                    <i class="pi pi-spin pi-spinner mr-2"></i>
                    <span>Loading customers...</span>
                </div>
            </ng-template>
        </p-multiSelect>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomerSelectComponent),
            multi: true
        }
    ]
})
export class CustomerSelectComponent implements ControlValueAccessor, OnInit {
    private customerClient = inject(CustomerServiceClient);
    private toast = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    // Input properties
    multiple = input<boolean>(false);
    placeholder = input<string>('Select customer...');
    showClear = input<boolean>(true);
    filter = input<boolean>(true);
    pageSize = input<number>(25);

    // ✅ Add auto-population input properties
    preloadCustomerId = input<string | undefined>(undefined);
    preloadCustomerIds = input<string[]>([]);
    autoLoadOnInit = input<boolean>(true);

    // Multi-select specific properties
    maxSelectedLabels = input<number>(2);
    selectedItemsLabel = input<string>('{0} customers selected');
    virtualScroll = input<boolean>(false); // ✅ Disabled virtual scroll for consistency
    virtualScrollItemSize = input<number>(43);

    // ✅ Output events
    customerSelected = output<CustomerDto | CustomerDto[] | null>();
    customerChanged = output<{ value: any, customer: CustomerDto | CustomerDto[] | null }>();

    // Internal state
    customers = signal<CustomerDto[]>([]);
    loading = signal<boolean>(false);
    control = new FormControl({ value: null, disabled: false });

    // Pagination state
    private currentPage = 1;
    private currentSearchTerm = '';
    private hasMorePages = true;

    // ControlValueAccessor implementation
    private onChange = (value: any) => { };
    private onTouched = () => { };

    async ngOnInit() {
        // Subscribe to control value changes
        this.control.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                this.onChange(value);
                this.onTouched();
            });

        // ✅ Handle auto-population based on input properties
        if (this.autoLoadOnInit()) {
            await this.handleAutoLoad();
        } else {
            // Load initial data only if no auto-population
            this.loadCustomers(true);
        }
    }

    // ✅ Add auto-load handler
    private async handleAutoLoad() {
        const singleId = this.preloadCustomerId();
        const multipleIds = this.preloadCustomerIds();

        if (singleId) {
            await this.searchAndSelectCustomer(singleId);
        } else if (multipleIds && multipleIds.length > 0) {
            await this.loadCustomersByIds(multipleIds);
        } else {
            // No preload data, load initial customers
            this.loadCustomers(true);
        }
    }

    // ✅ Load multiple customers by IDs for multi-select
    async loadCustomersByIds(customerIds: string[]): Promise<void> {
        if (!customerIds?.length) return;

        this.loading.set(true);
        try {
            let loadedCustomers: CustomerDto[] = [];
            loadedCustomers = await this.customerClient.getCustomersByIds({customerIds : customerIds});

            // Update customers list
            const existingCustomers = this.customers();
            const mergedCustomers = [...existingCustomers];
            
            loadedCustomers.forEach(customer => {
                const exists = mergedCustomers.find(c => c.id === customer.id);
                if (!exists) {
                    mergedCustomers.push(customer);
                }
            });

            this.customers.set(mergedCustomers);

            // Auto-select the loaded customers
            if (this.multiple()) {
                this.writeValue(customerIds);
                this.onChange(customerIds);
            }

        } catch (error) {
            console.error('Error loading customers by IDs:', error);
        } finally {
            this.loading.set(false);
        }
    }

    // Load specific customer by ID for edit scenarios
    async loadCustomerById(customerId: string): Promise<void> {
        this.loading.set(true);
        try {
            const customer = await this.customerClient.getCustomer(customerId);
            if (customer) {
                const existingCustomers = this.customers();
                const exists = existingCustomers.find(c => c.id === customer.id);
                if (!exists) {
                    this.customers.set([...existingCustomers, customer]);
                }
            }
        } catch (error) {
            console.error('Error loading customer by ID:', error);
        } finally {
            this.loading.set(false);
        }
    }

    // Search and auto-select a specific customer for edit mode
    async searchAndSelectCustomer(customerId: string): Promise<void> {
        await this.loadCustomerById(customerId);
        
        if (!this.multiple()) {
            this.writeValue(customerId);
            this.onChange(customerId);
        }
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
            // Find the selected customer(s) from the options
            const allCustomers = this.customers();

            if (this.multiple()) {
                // Multi-select: find all selected customers
                const selectedCustomers = allCustomers.filter(customer =>
                    Array.isArray(selectedValue) ? selectedValue.includes(customer.id) : false
                );
                this.customerSelected.emit(selectedCustomers);
                this.customerChanged.emit({ value: selectedValue, customer: selectedCustomers });
            } else {
                // Single select: find the selected customer
                const selectedCustomer = allCustomers.find(customer => customer.id === selectedValue);
                this.customerSelected.emit(selectedCustomer || null);
                this.customerChanged.emit({ value: selectedValue, customer: selectedCustomer || null });
            }
        } else {
            // No selection or cleared
            this.customerSelected.emit(null);
            this.customerChanged.emit({ value: null, customer: null });
        }
    }

    // Load customers with pagination and search
    async loadCustomers(reset: boolean = false, search: string = '') {
        if (reset) {
            this.currentPage = 1;
            this.customers.set([]);
            this.hasMorePages = true;
        }

        if (!this.hasMorePages && !reset) {
            return;
        }

        this.loading.set(true);
        this.currentSearchTerm = search;

        try {
            const query: GetCustomersQuery = {
                page: this.currentPage,
                pageSize: this.pageSize(),
                sortBy: 'name',
                sortDesc: false
            };

            // Add search filters
            if (search.trim()) {
                const searchTerm = search.trim();
                if (searchTerm.includes('@')) {
                    query.email = searchTerm;
                } else if (/^\d+$/.test(searchTerm)) {
                    query.phoneNumber = searchTerm;
                } else {
                    query.name = searchTerm;
                }
            }

            const result = await this.customerClient.getCustomers(query);
            const newItems = result.items || [];

            if (reset) {
                this.customers.set(newItems);
            } else {
                // Append new items for pagination
                const currentCustomers = this.customers();
                this.customers.set([...currentCustomers, ...newItems]);
            }

            // Check if there are more pages
            this.hasMorePages = newItems.length === this.pageSize();
            this.currentPage++;

        } catch (error) {
            this.toast.error('Failed to load customers');
        } finally {
            this.loading.set(false);
        }
    }

    // Search handler
    onSearch(event: any) {
        const query = event.filter || '';
        this.loadCustomers(true, query);
    }

    // Panel show handler
    onPanelShow() {
        // Reset and load fresh data when panel opens
        this.loadCustomers(true, '');
    }

    // Panel hide handler
    onPanelHide() {
        // Optional: cleanup or reset if needed
    }

    // Get customer subtitle text
    getCustomerSubText(customer: CustomerDto): string {
        const parts = [];
        if (customer.email) parts.push(customer.email);
        if (customer.phoneNumber) parts.push(customer.phoneNumber);
        return parts.join(' • ') || 'No contact info';
    }
}