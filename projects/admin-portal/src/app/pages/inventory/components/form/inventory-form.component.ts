import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, AfterViewChecked, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddInventoryItemCommand, DEFAULT_INVENTORY_CONSTANTS, InventoryItemDto, InventoryServiceClient, itemConditionOptions, ProductDto, ProductServiceClient, UpdateInventoryItemCommand } from '@saanjhi-creation-ui/shared-common';
import { ProductSelectComponent, UiAutocompleteComponent, UiFormControlComponent, UiTextareaComponent, UiInputNumberComponent, UiInputComponent, UiButtonComponent, UiConfirmDialogComponent } from '@saanjhi-creation-ui/shared-ui';
import { DropdownModule } from 'primeng/dropdown';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { AdminBaseComponent } from '../../../../common/components/base/admin-base.component';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { signal } from '@angular/core';
import { colorAvailableValidator, retirementFieldRequiredValidator, sizeAvailableValidator } from './inventory-form.validators';
import { MessageModule } from 'primeng/message';
import { ImageModule } from 'primeng/image'


@Component({
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: ['./inventory-form.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiFormControlComponent,
        DropdownModule,
        ProductSelectComponent,
        UiAutocompleteComponent,
        DatePickerModule,
        UiTextareaComponent,
        UiInputNumberComponent,
        UiInputComponent,
        UiButtonComponent,
        CheckboxModule,
        MessageModule,
        RouterModule,
        UiConfirmDialogComponent,
        ImageModule
    ]
})
export class InventoryFormComponent extends AdminBaseComponent implements AfterViewChecked {


    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private inventoryService = inject(InventoryServiceClient);
    private productService = inject(ProductServiceClient);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;


    @Input() item?: InventoryItemDto;
    @Output() cancel = new EventEmitter<void>();

    formGroup?: FormGroup;
    availableSizes: string[] = [];
    availableColors: string[] = [];
    availableConditions = itemConditionOptions;
    isEditMode = signal(false);
    model?: InventoryItemDto;

    get form(): FormGroup {
        return this.formGroup!;
    }

    async ngOnInit() {
        this.formGroup = this.fb.group({
            productId: [null, Validators.required],
            size: [{ value: null, disabled: true }, [Validators.required, sizeAvailableValidator(() => this.availableSizes)]],
            color: [{ value: null, disabled: true }, [Validators.required, colorAvailableValidator(() => this.availableColors)]],
            condition: [{ value: DEFAULT_INVENTORY_CONSTANTS.CONDITION, disabled: true }, [Validators.required]],
            acquisitionCost: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]],
            acquisitionDate: [{ value: null, disabled: true }, [Validators.required]],
            warehouseLocation: [{ value: DEFAULT_INVENTORY_CONSTANTS.WAREHOUSE_LOCATION, disabled: true }, [Validators.required]],
            conditionNotes: [{ value: '', disabled: true }],
            isRetired: [false],
            retirementReason: [null, [retirementFieldRequiredValidator('retirementReason')]],
            retirementDate: [null, [retirementFieldRequiredValidator('retirementDate')]]
        });
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.model = await this.loadInventoryItemById(id);
            if (this.model) {
                this.availableSizes = this.model.availableSizes || [];
                this.availableColors = this.model.availableColors || [];
                this.form.patchValue(
                    {
                        ...this.model,
                        retirementDate: this.model.retirementDate ? new Date(this.model.retirementDate) : null,
                        acquisitionDate: this.model.acquisitionDate ? new Date(this.model.acquisitionDate) : null
                    });
                this.enableAllFields();
                this.formGroup.markAllAsTouched();
                this.formGroup.updateValueAndValidity();
            }
        } else if (this.item) {
            this.form.patchValue(this.item);
        }
    }

    ngAfterViewChecked(): void {
        if (!this.isEditMode() && this.model) {
            this.isEditMode.set(true);
        }
    }

    async onSubmit() {
        const success = await this.save();
        if (success) {
            this.navigation.goTo('/inventory');
        }
    }

    async onSaveAndAddMore() {
        const success = await this.save();
        if (success) {
            this.onReset();
        }
    }

    onReset() {
        this.form.reset();
        this.disableAllFields();
        this.availableSizes = [];
        this.availableColors = [];
    }

    onCancel() {
        this.navigation.goTo('/inventory');
    }

    enableAllFields() {
        this.form.get('size')?.enable();
        this.form.get('color')?.enable();
        this.form.get('condition')?.enable();
        this.form.get('acquisitionCost')?.enable();
        this.form.get('acquisitionDate')?.enable();
        this.form.get('warehouseLocation')?.enable();
        this.form.get('conditionNotes')?.enable();
    }

    disableAllFields() {
        this.form.get('size')?.disable();
        this.form.get('color')?.disable();
        this.form.get('condition')?.disable();
        this.form.get('acquisitionCost')?.disable();
        this.form.get('acquisitionDate')?.disable();
        this.form.get('warehouseLocation')?.disable();
        this.form.get('conditionNotes')?.disable();
    }

    onProductSelected(event: ProductDto | ProductDto[] | null) {

        if (!event) {
            this.disableAllFields();
            this.availableSizes = [];
            this.availableColors = [];
            return;
        }

        if (event && !Array.isArray(event) && event !== null) {
            this.form.patchValue({
                productId: event.id,
                size: null,
                color: null,
                condition: DEFAULT_INVENTORY_CONSTANTS.CONDITION,
                acquisitionCost: null,
                acquisitionDate: null,
                warehouseLocation: DEFAULT_INVENTORY_CONSTANTS.WAREHOUSE_LOCATION,
                conditionNotes: ''
            });

            // Enable fields that depend on product selection
            this.enableAllFields();

            // Set available sizes and colors based on the selected product
            this.availableSizes = event.availableSizes || [];
            this.availableColors = event.availableColors || [];
        }
    }

    onIsRetiredChange(event: CheckboxChangeEvent) {
        this.form.get('retirementReason')?.updateValueAndValidity();
        this.form.get('retirementDate')?.updateValueAndValidity();
    }

    onGenerateCodes() {
        if (this.isEditMode() && this.model?.id) {
            this.confirmDialog.open({
                message: this.formatter.format(this.model.qrCodeImageBase64 ? this.ConfirmationMessages.generateCodeConfirmationForAlreadyGenerated : this.ConfirmationMessages.generateCodeConfirmation, this.model?.serialNumber),
                accept: async () => {
                    try {
                        await this.inventoryService.generateCodes(this.model!.id);
                        this.toast.success(this.formatter.format(this.ConfirmationMessages.generateCodeConfirmation, this.model?.serialNumber));
                    } catch (error) {
                        this.toast.error(this.formatter.format(this.ConfirmationMessages.generateCodeFailed, this.model?.serialNumber));
                    }
                }
            });
        }
    }

    private async save(): Promise<boolean> {
        if (this.form.valid) {
            if (this.isEditMode() && this.model?.id) {
                const inventoryItem: UpdateInventoryItemCommand = {
                    id: this.model.id,
                    ...this.form.value
                };
                try {
                    await this.inventoryService.update(this.model.id, inventoryItem);
                    return true;
                } catch (error) {
                    console.error('Error updating inventory item:', error);
                    return false;
                }
            } else {
                const inventoryItem: AddInventoryItemCommand = this.form.value;
                try {
                    await this.inventoryService.add(inventoryItem);
                    return true;
                } catch (error) {
                    console.error('Error saving inventory item:', error);
                    return false;
                }
            }
        } else {
            this.form.markAllAsTouched();
        }
        return false;
    }

    private async loadInventoryItemById(id: string): Promise<InventoryItemDto | undefined> {
        try {
            const item = await this.inventoryService.getById(id);
            return item;
        } catch (error) {
            console.error('Error loading inventory item:', error);
            return undefined;
        }
    }
}