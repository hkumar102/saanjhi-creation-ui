import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import { UiFormFieldComponent, UiInputComponent, UiButtonComponent, CustomerSelectComponent, ProductSelectComponent, UiAutocompleteComponent } from "@saanjhi-creation-ui/shared-ui";
import { CommonModule } from '@angular/common';
import { AddressDto, CreateRentalCommand, CustomerDto, MediaServiceClient, ProductDto, RentalDto, RentalServiceClient, RentalStatusOptions, UpdateRentalCommand } from '@saanjhi-creation-ui/shared-common';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FileUploadModule, FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { Image } from "primeng/image";


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
        UiAutocompleteComponent,
        ProductSelectComponent,
        CustomerSelectComponent,
        UiAutocompleteComponent,
        FileUpload,
        Image
    ],
})
export class RentalFormComponent extends AdminBaseComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private rentalService = inject(RentalServiceClient);
    private mediaService = inject(MediaServiceClient);

    form!: FormGroup;
    rentalId!: string;
    filteredProducts: ProductDto[] = [];
    filteredCustomers: CustomerDto[] = [];
    shippingAddresses: AddressDto[] = [];
    editingRental?: RentalDto;
    isLoading = false;
    rentalStatuses = RentalStatusOptions;
    receiptDocument: File | null = null;

    get isEditMode(): boolean {
        return !!this.rentalId;
    }

    async ngOnInit(): Promise<void> {

        this.form = this.fb.group({
            id: [null],
            productId: [null, Validators.required],
            customerId: [null, Validators.required],
            shippingAddressId: [null, Validators.required],
            bookingDate: [null, Validators.required],
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
            status: [1, Validators.required],
            bookNumber: [null, Validators.required],
            receiptDocumentUrl: [null],
        });

        this.rentalId = this.route.snapshot.paramMap.get('id') || '';
        if (this.isEditMode) {
            this.isLoading = true;
            await this.loadRental();
            this.isLoading = false;
        }
    }

    async loadRental(): Promise<void> {
        const rental = await this.rentalService.getRental(this.rentalId);
        this.shippingAddresses = rental.customer?.addresses as AddressDto[] || [];
        this.form.patchValue({
            ...rental,
            startDate: rental.startDate ? new Date(rental.startDate) : null,
            endDate: rental.endDate ? new Date(rental.endDate) : null,
            productId: rental.product?.id || null,
            customerId: rental.customer?.id || null,
            bookingDate: rental.bookingDate ? new Date(rental.bookingDate) : null,
        });

        this.form.updateValueAndValidity();
        this.editingRental = rental;
    }

    async save(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }


        if (this.receiptDocument) {
            var fileResult = await this.mediaService.upload('BookingReceipts', this.receiptDocument);
            this.form.patchValue({
                receiptDocumentUrl: fileResult.url
            });

            if (this.editingRental) {
                this.editingRental.receiptDocumentUrl = fileResult.url;
            }

            this.toast.success('File uploaded successfully');
        }

        const value = this.form.value;


        if (this.isEditMode) {
            const command: UpdateRentalCommand = value as UpdateRentalCommand;
            command.startDate = value.startDate ? value.startDate.toISOString() : null;
            command.endDate = value.endDate ? value.endDate.toISOString() : null;
            command.bookingDate = value.bookingDate ? value.bookingDate.toISOString() : null;
            await this.rentalService.updateRental(value.id!, command);
            this.toast.success('Rental updated successfully');
        } else {
            const command: CreateRentalCommand = value as CreateRentalCommand;
            command.startDate = value.startDate ? value.startDate.toISOString() : null;
            command.endDate = value.endDate ? value.endDate.toISOString() : null;
            command.bookingDate = value.bookingDate ? value.bookingDate.toISOString() : null;
            await this.rentalService.createRental(command);
            this.toast.success('Rental created successfully');
        }
        this.navigation.goToRentals();
    }

    cancel(): void {
        this.navigation.goToRentals();
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

    async onFileSelect(event: FileSelectEvent): Promise<void> {
        const files = event.files;
        for (const file of files) {
            this.receiptDocument = file;
            break; // Assuming only one file is uploaded at a time
        }
    }

    removeFile() {
        this.form.patchValue({
            receiptDocumentUrl: null
        });

        if (this.editingRental) {
            this.editingRental.receiptDocumentUrl = undefined;
        }

        this.receiptDocument = null;
    }
}