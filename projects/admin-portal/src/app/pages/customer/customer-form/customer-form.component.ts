import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomerServiceClient, CreateCustomerCommand, UpdateCustomerCommand, AddressDto, UpdateAddressCommand, CreateAddressCommand, AddressTypePipe } from '@saanjhi-creation-ui/shared-common';
import { CommonModule } from '@angular/common';
import { UiButtonComponent, UiFormErrorComponent, UiFormFieldComponent, UiInputComponent } from '@saanjhi-creation-ui/shared-ui';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiButtonComponent,
    UiFormErrorComponent,
    UiFormFieldComponent,
    UiInputComponent,
    TableModule,
    DialogModule,
    AddressTypePipe
  ],
})
export class CustomerFormComponent extends AdminBaseComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private customerClient = inject(CustomerServiceClient);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  customerId!: string;
  isEditMode = false;

  addresses: AddressDto[] = [];
  showAddressDialog = false;
  addressForm!: FormGroup;
  editingAddressIndex: number | null = null;

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.customerId;

    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['customer@saanjhicreation.com', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
    });

    this.addressForm = this.fb.group({
      id: [null],
      customerId: [this.customerId],
      line1: ['', Validators.required],
      line2: [''],
      city: ['Palam', Validators.required],
      state: ['Delhi', Validators.required],
      postalCode: [null, Validators.required],
      country: ['India', Validators.required],
      type: [0],
      phoneNumber: ['', Validators.required],
    });

    if (this.isEditMode) {
      this.loadCustomer();
    }
  }

  async loadCustomer(): Promise<void> {
    const customer = await this.customerClient.getCustomer(this.customerId);
    this.form.patchValue(customer);
    this.addresses = customer.addresses ?? [];
  }

  async onSubmit(): Promise<void> {
    const customerPayload: CreateCustomerCommand | UpdateCustomerCommand = {
      ...this.form.value,
      id: this.customerId
    };

    if (this.isEditMode) {
      try {
        await this.customerClient.updateCustomer(customerPayload as UpdateCustomerCommand);
        await this.saveAddress();
        this.toast.success(this.formatter.format(this.ConfirmationMessages.updateSuccess, customerPayload.name!));
      } catch (error) {
        this.toast.error(this.formatter.format(this.ConfirmationMessages.updateFailed, customerPayload.name!));
        return;
      }
    } else {
      try {
        const id = await this.customerClient.createCustomer(customerPayload as CreateCustomerCommand);
        this.customerId = id;
        await this.saveAddress();
        this.toast.success(this.formatter.format(this.ConfirmationMessages.createSuccess, customerPayload.name!));
      } catch (error) {
        this.toast.error(this.formatter.format(this.ConfirmationMessages.createFailed, customerPayload.name!));
        return;
      }
    }

    this.navigation.goToCustomers();
  }

  async saveAddress(): Promise<void> {
    const addresses: AddressDto[] = this.addresses;
    const addressOperations = addresses.map((address) => {
      if (address.id) {
        return this.customerClient.updateAddress(address.id, {
          ...address,
          customerId: this.customerId,
        } as UpdateAddressCommand);
      } else {
        return this.customerClient.createAddress({
          ...address,
          customerId: this.customerId,
        } as CreateAddressCommand);
      }
    });

    await Promise.all(addressOperations);
  }

  openAddAddress(): void {
    this.editingAddressIndex = null;
    this.addressForm.reset();
    this.showAddressDialog = true;
  }

  editAddress(address: AddressDto): void {
    this.editingAddressIndex = this.addresses.indexOf(address);
    this.addressForm.patchValue(address);
    this.showAddressDialog = true;
    this.addressForm.markAllAsDirty();
    this.addressForm.markAllAsTouched();
    this.addressForm.updateValueAndValidity();
  }

  async onSaveAddress() {
    const address: AddressDto = {
      ...this.addressForm.value
    };



    if (this.editingAddressIndex != null) {
      this.addresses[this.editingAddressIndex] = address;
    } else {
      this.addresses.push(address);
    }

    this.showAddressDialog = false;
  }

  deleteAddress(address: AddressDto): void {
    this.addresses.splice(this.addresses.indexOf(address), 1);
  }

  goBack() {
    this.navigation.goToCustomers();
  }

  addAddress(): void {
    this.editingAddressIndex = null;
    this.addressForm.reset();
    this.showAddressDialog = true;
    if (this.addresses.length == 0) {
      this.addressForm.patchValue({
        phoneNumber: this.form.value.phoneNumber,
        type: 0, // Default type
      });
    }
  }
}
