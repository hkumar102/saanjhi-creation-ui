import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AddressFormatPipe, BaseComponent, InventoryItemDto, ProductDto, RentalDto, ItemConditionLabelPipe, AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';
import { UiFormControlComponent, UiButtonComponent, UiInputNumberComponent, UiInputComponent, UiTextareaComponent } from '@saanjhi-creation-ui/shared-ui';
import { debounceTime, takeUntil } from 'rxjs';
import { AdminBaseComponent } from '../../../../../common/components/base/admin-base.component';
import { DatePicker } from "primeng/datepicker";
import { CreateRentalModel } from '../../models/create-rental.model';
import { TableModule } from "primeng/table";

@Component({
    selector: 'app-create-rental-details-step',
    standalone: true,
    templateUrl: './rental-details-step.component.html',
    styleUrls: ['./rental-details-step.component.scss'],
    imports: [
    CommonModule,
    UiFormControlComponent,
    UiInputComponent,
    ReactiveFormsModule,
    DatePicker,
    UiInputNumberComponent,
    AddressFormatPipe,
    ItemConditionLabelPipe,
    AppCurrencyPipe,
    TableModule,
    UiTextareaComponent
]
})
export class RentalCreateDetailsStepComponent extends BaseComponent implements OnInit {
    @Input() rentalDetails: RentalDto | null = null;
    @Input() rentalModel: CreateRentalModel | null = null;
    @Output() rentalDetailsChanged = new EventEmitter<any>();
    private fb = inject(FormBuilder);

    form!: FormGroup;
    products: ProductDto[] = [];
    expandedRows = {};

    ngOnInit(): void {
        if (!this.form) {
            this.form = this.fb.group({
                productId: [null, Validators.required],
                inventoryItemId: [null, Validators.required],
                customerId: [null, Validators.required],
                shippingAddressId: [null, Validators.required],
                startDate: [new Date(), Validators.required],
                endDate: [new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), Validators.required],
                rentalPrice: [0, [Validators.required, Validators.min(0)]],
                dailyRate: [0, [Validators.min(0)]],
                securityDeposit: [0, [Validators.required, Validators.min(0)]],
                lateFee: [0, [Validators.min(0)]],
                damageFee: [0, [Validators.min(0)]],
                height: [''],
                chest: [''],
                waist: [''],
                hip: ['-'],
                shoulder: ['-'],
                sleeveLength: ['-'],
                inseam: ['-'],
                bookNumber: [null, Validators.required],
                notes: [''],
                measurementNotes: ['']
            });
        }

        if (this.rentalModel) {
            this.products = this.rentalModel?.products || [];
            this.products.forEach(product => {
                product.inventoryItems = this.getProductInventoryItems(product);
            });

            this.form.patchValue({
                productId: this.rentalModel.products && this.rentalModel.products[0]?.id || null,
                inventoryItemId: this.rentalModel.inventoryItems && this.rentalModel.inventoryItems[0]?.id || null,
                customerId: this.rentalModel.customer?.customer?.id || null,
                shippingAddressId: this.rentalModel.customer?.shippingAddress?.id || null,
                rentalPrice: this.rentalModel.products && this.rentalModel.products[0]?.rentalPrice || null,
                securityDeposit: this.rentalModel.products && this.rentalModel.products[0]?.securityDeposit || null,
            })
        }

        if (this.rentalDetails) {
            this.form.patchValue(this.rentalDetails);
        }




        this.form.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
            this.onDetailsChanged();
        });

    }

    onDetailsChanged(): void {
        if (this.form.valid) {
            this.rentalDetailsChanged.emit(this.form.value);
        }
    }

    getProductInventoryItems(product: ProductDto): InventoryItemDto[] {
        return this.rentalModel?.inventoryItems?.filter(item => item.productId === product.id) || [];
    }
}