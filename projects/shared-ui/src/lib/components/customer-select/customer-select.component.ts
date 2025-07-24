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
    ToastService,
    CustomerServiceClient,
    CustomerDto,
    GetCustomersQuery
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
    selector: 'saanjhi-ui-customer-select',
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
            [suggestions]="customers()" 
            [dropdown]="true" 
            [multiple]="multiple()"
            [forceSelection]="true"
            (completeMethod)="onSearch($event)"
            (onSelect)="handleAutoCompleteSelect($event)"
            (onUnselect)="handleAutoCompleteSelect($event)"
            [placeholder]="placeholder()"
            styleClass="w-full">
            <ng-template let-customer #item>
                 <div class="flex items-center gap-2">                    
                    <div>{{ customer.name }}</div>
                    <div>{{ customer.phoneNumber }}</div>
                    <div>{{ customer.email }}</div>
                </div>
            </ng-template>
        </saanjhi-ui-autocomplete>
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
    private cdr = inject(ChangeDetectorRef);

    // Input properties
    multiple = input<boolean>(false);
    placeholder = input<string>('Select customer...');
    showClear = input<boolean>(true);
    filter = input<boolean>(true);
    pageSize = input<number>(25);


    // Output events
    customerSelected = output<CustomerDto | CustomerDto[] | null>();

    // Internal state
    customers = signal<CustomerDto[]>([]);
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
            let customerIds: string[] = [];
            if (Array.isArray(value)) {
                customerIds = value;
            } else {
                customerIds = [value];
            }

            if (this.hasCustomersLoaded(customerIds)) {
                this.control.setValue(value);
            } else {
                await this.loadCustomersByIds(customerIds);
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

        try {
            const query: GetCustomersQuery = {
                page: this.currentPage,
                pageSize: this.pageSize(),
                sortBy: 'name',
                sortDesc: false
            };

            // Add search filter
            if (search.trim()) {
                query.search = search.trim();
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
            this.toast.error('Failed to load products');
        } finally {
            this.loading.set(false);
        }
    }

    // Search handler
    onSearch(event: any) {
        const query = event.query || '';
        this.loadCustomers(true, query);
    }

    // Get customer subtitle text
    getCustomerSubText(customer: CustomerDto): string {
        const parts = [];
        if (customer.email) parts.push(customer.email);
        if (customer.name) parts.push(customer.name);
        if (customer.phoneNumber) parts.push(customer.phoneNumber);
        return parts.join(' • ') || 'No additional info';
    }

    // ✅ Load multiple customers by IDs for multi-select
    async loadCustomersByIds(customerIds: string[]): Promise<void> {
        if (!customerIds?.length) return;

        this.loading.set(true);
        try {
            const loadedCustomers: CustomerDto[] = [];

            const result = await this.customerClient.getCustomersByIds({ customerIds });
            if (result) {
                loadedCustomers.push(...result);
            }

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

        } catch (error) {
            console.error('Error loading products by IDs:', error);
        } finally {
            this.loading.set(false);
        }
    }

    handleAutoCompleteSelect(event: CustomerDto | CustomerDto[]) {
        this.customerSelected.emit(event);
        if (event) {
            if (this.multiple()) {
                this.onChange((event as CustomerDto[]).map(c => c.id));
            } else {
                this.onChange(event);
            }
        }
    }

    hasCustomersLoaded(customerIds: string[]): boolean {
        const loadedCustomerIds = this.customers().map(c => c.id);
        return customerIds.every(id => loadedCustomerIds.includes(id));
    }
}