import { Component, EventEmitter, Output, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiFormControlComponent, CustomerSelectComponent } from '@saanjhi-creation-ui/shared-ui';
import { CustomerDto, BaseComponent, AddressDto } from '@saanjhi-creation-ui/shared-common';
import { RentalCreateCustomerModel } from '../../models/create-rental.model';
import { TableModule, TableRowSelectEvent } from 'primeng/table';

@Component({
    selector: 'app-rental-create-select-customer-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiFormControlComponent,
        CustomerSelectComponent,
        TableModule
    ],
    templateUrl: './select-customer-step.component.html',
    styleUrls: ['./select-customer-step.component.scss']
})
export class RentalCreateSelectCustomerStepComponent extends BaseComponent implements OnInit {
    @Output() customerSelected = new EventEmitter<RentalCreateCustomerModel | null>();
    @Input() selectedCustomer: RentalCreateCustomerModel | null = null;

    defaultCustomer: RentalCreateCustomerModel = {
        customer: null,
        shippingAddress: null
    }

    selectedAddress: AddressDto | null = null;

    private readonly fb = inject(FormBuilder);

    form: FormGroup = this.fb.group({
        customer: [null, Validators.required],
        shippingAddress: [null, Validators.required]
    });

    ngOnInit(): void {
        if (this.selectedCustomer) {
            this.form.patchValue({ customer: this.selectedCustomer.customer?.id, shippingAddress: this.selectedCustomer.shippingAddress?.id });
            this.selectedAddress = this.selectedCustomer.shippingAddress;
        } else {
            this.selectedCustomer = this.defaultCustomer;
        }
    }

    onCustomerChange(customer: CustomerDto | CustomerDto[] | null): void {
        this.selectedCustomer!.customer = customer as CustomerDto;
        if (this.selectedCustomer!.customer && this.selectedCustomer!.customer.addresses && this.selectedCustomer!.customer.addresses.length == 1) {
            this.selectedCustomer!.shippingAddress = this.selectedCustomer!.customer.addresses[0];
            this.selectedAddress = this.selectedCustomer!.shippingAddress;
            this.form.patchValue({ shippingAddress: this.selectedCustomer!.shippingAddress.id });
        }

        this.customerSelected.emit(this.selectedCustomer);
    }

    onAddressRowSelected(event: TableRowSelectEvent<AddressDto>): void {
        if (!event.data) return;
        const selected = event.data as AddressDto;
        this.selectedCustomer!.shippingAddress = selected;
        this.form.patchValue({ shippingAddress: selected.id });
        this.customerSelected.emit(this.selectedCustomer);
    }
}