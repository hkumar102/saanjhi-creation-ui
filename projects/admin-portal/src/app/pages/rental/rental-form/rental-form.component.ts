import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { UiFormFieldComponent, UiInputComponent, UiButtonComponent, UiDropdownComponent, CustomerSelectComponent, ProductSelectComponent } from "@saanjhi-creation-ui/shared-ui";
import { CommonModule } from '@angular/common';
import { AddressDto, CreateRentalCommand, CustomerDto, CustomerServiceClient, ProductDto, ProductServiceClient, RentalServiceClient, UpdateRentalCommand } from '@saanjhi-creation-ui/shared-common';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    selector: 'app-rental-form',
    templateUrl: './rental-form.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiFormFieldComponent,
        UiInputComponent,
        UiButtonComponent,
        DatePickerModule,
        AutoCompleteModule,
        UiDropdownComponent,
        ProductSelectComponent,
        CustomerSelectComponent,
    ],
})
export class RentalFormComponent extends AdminBaseComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private rentalService = inject(RentalServiceClient);
    private productService = inject(ProductServiceClient);
    private customerService = inject(CustomerServiceClient);

    form!: FormGroup;
    rentalId!: string;
    filteredProducts: ProductDto[] = [];
    filteredCustomers: CustomerDto[] = [];
    shippingAddresses: AddressDto[] = [];

    get isEditMode(): boolean {
        return !!this.rentalId;
    }

    async ngOnInit(): Promise<void> {

        this.form = this.fb.group({
            id: [null],
            productId: [null, Validators.required],
            customerId: [null, Validators.required],
            shippingAddressId: [null, Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            rentalPrice: [null, Validators.required],
            securityDeposit: [null, Validators.required],
            height: [],
            chest: [],
            waist: [],
            hip: [],
            shoulder: [],
            sleeveLength: [],
            inseam: [],
            notes: [],
        });

        this.rentalId = this.route.snapshot.paramMap.get('id') || '';
        if (this.isEditMode) {
            await this.loadRental();
        }
    }

    async loadRental(): Promise<void> {
        const rental = await this.rentalService.getRental(this.rentalId);
        if (rental.customer) {
            this.filteredCustomers = [rental.customer as CustomerDto];
            this.shippingAddresses = rental.customer.addresses as AddressDto[] || [];
            this.form.patchValue({ customer: rental.customer });
        }

        if (rental.product) {
            const product = rental.product as ProductDto;
            this.filteredProducts = [product];
            this.form.patchValue({ product: product });
        }
        this.form.patchValue({
            ...rental,
            startDate: rental.startDate ? new Date(rental.startDate) : null,
            endDate: rental.endDate ? new Date(rental.endDate) : null,
        });

        this.form.updateValueAndValidity();
    }

    async save(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.value;

        if (this.isEditMode) {
            const command: UpdateRentalCommand = value as UpdateRentalCommand;
            command.startDate = value.startDate ? value.startDate.toISOString() : null;
            command.endDate = value.endDate ? value.endDate.toISOString() : null;
            await this.rentalService.updateRental(value.id!, command);
            this.toast.success('Rental updated successfully');
        } else {
            const command: CreateRentalCommand = value as CreateRentalCommand;
            command.startDate = value.startDate ? value.startDate.toISOString() : null;
            command.endDate = value.endDate ? value.endDate.toISOString() : null;
            await this.rentalService.createRental(command);
            this.toast.success('Rental created successfully');
        }
        this.navigation.goToRentals();
    }

    cancel(): void {
        this.navigation.goToRentals();
    }

    searchProducts(event: { query: string }) {
        const query = event.query.toLowerCase();
        this.productService.getAll({ search: query, pageSize: 10 }).then(response => {
            this.filteredProducts = response.items || [];
        });
    }

    searchCustomers(event: { query: string }) {
        const query = event.query.toLowerCase();
        this.customerService.getCustomers({ name: query, pageSize: 10 }).then(response => {
            this.filteredCustomers = response.items || [];
        });
    }

    async onCustomerChange(customer: CustomerDto | CustomerDto[] | null) {
        if (customer && !Array.isArray(customer)) {
            this.shippingAddresses = customer.addresses || [];
        }
    }

    onProductChange(product: ProductDto | ProductDto[] | null) {
        if (product && !Array.isArray(product)) {
            this.form.patchValue({
                rentalPrice: product.rentalPrice,
                securityDeposit: product.securityDeposit,
            });
        }
    }
}