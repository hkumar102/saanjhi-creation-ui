import { Component, OnInit, OnDestroy, inject, signal, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ProductWorkflowService } from '../../../services/product-workflow.service';
import { WorkflowStep, InventoryItemData } from '../../../models/product-workflow.models';
import { UiAutocompleteComponent, UiButtonComponent, UiCheckboxComponent, UiConfirmDialogComponent, UiDropdownComponent, UiFormControlComponent, UiInputComponent, UiInputNumberComponent, UiTextareaComponent } from '@saanjhi-creation-ui/shared-ui';
import { DividerModule } from 'primeng/divider';
import { DatePicker } from "primeng/datepicker";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AdminBaseComponent } from '../../../../../common/components/base/admin-base.component';
import { AvailableColors, AvailableSizes, inventoryStatusOptions, itemConditionOptions } from '@saanjhi-creation-ui/shared-common';
@Component({
  selector: 'app-inventory-setup-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DividerModule,
    UiFormControlComponent,
    UiInputComponent,
    UiButtonComponent,
    UiTextareaComponent,
    UiInputNumberComponent,
    DatePicker,
    AutoCompleteModule,
    UiConfirmDialogComponent,
    UiCheckboxComponent,
    UiAutocompleteComponent
  ],
  templateUrl: './inventory-setup-step.component.html',
  styleUrls: ['./inventory-setup-step.component.scss']
})
export class InventorySetupStepComponent extends AdminBaseComponent implements OnInit, OnDestroy {

  private workflowService = inject(ProductWorkflowService);
  private fb = inject(FormBuilder);

  @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;


  @Input() form!: FormGroup;
  isLoading = signal(false);
  conditionOptions = itemConditionOptions
  availableSizes: string[] = [];
  availableColors: string[] = [];
  availableStatuses = inventoryStatusOptions;

  ngOnInit(): void {
    this.loadFromWorkflow();
    this.form.valueChanges.subscribe(() => {
      this.saveToWorkflow();
    });
  }

  ngOnDestroy(): void { }

  get inventoryItems(): FormArray<FormGroup> {
    return this.form.get('inventoryItems') as FormArray<FormGroup>;
  }

  addItem(): void {
    this.inventoryItems.push(this.createItemForm());
    this.saveToWorkflow();
  }

  removeItem(index: number): void {
    this.confirmDialog.open({
      message: this.formatter.format(this.ConfirmationMessages.deleteConfirmation, 'Inventory Item'),
      accept: async () => {
        try {
          this.inventoryItems.removeAt(index);
          this.saveToWorkflow();
        } catch (error) {
          this.toast.error(this.formatter.format(this.ConfirmationMessages.deleteFailed, 'Inventory Item'));
        }
      }
    });
  }

  createItemForm(data?: Partial<InventoryItemData>): FormGroup {
    const state = this.workflowService.state();
    return this.fb.group({
      id: [data?.id],
      productId: [data?.productId || state.productId, Validators.required],
      size: [data?.size || null, Validators.required],
      color: [data?.color || null, Validators.required],
      condition: [data?.condition || 1, Validators.required],
      status: [data?.status, Validators.required],
      acquisitionDate: [data?.acquisitionDate ? new Date(data?.acquisitionDate) : new Date(), Validators.required],
      acquisitionCost: [data?.acquisitionCost || 0, [Validators.required, Validators.min(1)]],
      serialNumber: [data?.serialNumber || ''],
      conditionNotes: [data?.conditionNotes || ''],
      warehouseLocation: [data?.warehouseLocation || '', Validators.required],
      isRetired: [data?.isRetired],
      retirementReason: [data?.retirementReason || ''],
      retirementDate: [data?.retirementDate ? new Date(data?.retirementDate) : null]
    });
  }

  loadFromWorkflow(): void {
    const state = this.workflowService.state();
    const setup = state.inventoryData;
    const productDetails = state.productDetails;
    if (setup?.inventoryItems?.length) {
      this.inventoryItems.clear();
      setup.inventoryItems.forEach(item => {
        this.inventoryItems.push(this.createItemForm(item));
      });
      this.inventoryItems.markAsUntouched();
      this.inventoryItems.markAsPristine();
      this.inventoryItems.updateValueAndValidity();
      // Show validation errors for invalid fields on page load
      Object.keys(this.inventoryItems.controls).forEach(key => {
        const control = (this.inventoryItems.get(key) as FormGroup);
        if (control) {
          Object.values(control.controls).forEach(ctrl => {
            ctrl.markAsTouched();
            ctrl.markAsDirty();
          });
        }
      });
    }

    if (productDetails) {
      this.availableSizes = productDetails.availableSizes || [];
      this.availableColors = productDetails.availableColors || [];
    }

    if (setup) {
      this.workflowService.updateStepData(this.workflowService.state().currentStep, { ...setup, isValid: this.form.valid });
    }
  }

  saveToWorkflow(): void {
    const items: InventoryItemData[] = this.inventoryItems.value;
    this.workflowService.updateStepData(WorkflowStep.INVENTORY_SETUP, {
      inventoryItems: items,
      isValid: this.form.valid
    });
  }
}
