import { Component, OnInit, OnDestroy, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ProductWorkflowService } from '../../../services/product-workflow.service';
import { BasicInfoData, ProductWorkflowState, WorkflowStep } from '../../../models/product-workflow.models';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ChipsModule } from 'primeng/chips';

// Shared UI Components
import { CategorySelectComponent, UiFormControlComponent, UiInputComponent, UiCheckboxComponent, UiInputNumberComponent, UiTextareaComponent } from '@saanjhi-creation-ui/shared-ui';
import { CategoryDto } from '@saanjhi-creation-ui/shared-common';
import { BaseProductFlowComponent } from '../../base-product-flow.component';

@Component({
  selector: 'app-basic-info-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    FloatLabelModule,
    CardModule,
    DividerModule,
    ChipsModule,
    CategorySelectComponent,
    UiFormControlComponent,
    UiInputComponent,
    UiCheckboxComponent,
    UiInputNumberComponent,
    TextareaModule,
    UiTextareaComponent
  ],
  templateUrl: './basic-info-step.component.html',
  styleUrls: ['./basic-info-step.component.scss']
})
export class BasicInfoStepComponent extends BaseProductFlowComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);

  model = this.workflowService.state().basicInfo;
  @Input() form!: FormGroup;
  isLoading = signal(false);

  constructor() {
    super();
    //this.form = this.createForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initializeForm();
    this.setupFormSubscription();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override onWorkflowDataInitialized(data: ProductWorkflowState): void {
    if (data.basicInfo) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    const state = this.workflowService.state();
    const stepData = state.basicInfo;
    if (stepData) {
      this.form.patchValue({
        name: stepData.name || '',
        description: stepData.description || '',
        categoryId: stepData.categoryId || '',
        categoryName: stepData.categoryName || '',
        purchasePrice: stepData.purchasePrice || null,
        rentalPrice: stepData.rentalPrice || null,
        isActive: stepData.isActive !== undefined ? stepData.isActive : true,
        isPurchasable: stepData.isPurchasable !== undefined ? stepData.isPurchasable : true,
        isRentable: stepData.isRentable !== undefined ? stepData.isRentable : true,
        securityDeposit: stepData.securityDeposit || null,
        maxRentalDays: stepData.maxRentalDays || null,
      }, { emitEvent: false });

      this.workflowService.updateStepData(WorkflowStep.BASIC_INFO, { ...stepData, isValid: this.form.valid });
      //this.form.updateValueAndValidity(); // Ensure form is valid on init
      this.form.markAsPristine(); // Mark form as pristine to avoid initial dirty state
      this.form.markAsUntouched(); // Mark form as untouched to avoid initial validation errors
      setTimeout(() => {
        Object.keys(this.form.controls).forEach(key => {
          const control = this.form.get(key);
          if (control && control.invalid) {
            control.markAsTouched();
            control.markAsDirty();
          }
        });
      });
    }


  }

  private setupFormSubscription(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.updateWorkflowData();
      });
  }

  private updateWorkflowData(): void {
    const stepData: BasicInfoData = { ...this.form.value, isValid: this.form.valid };

    this.workflowService.updateStepData(WorkflowStep.BASIC_INFO, stepData);
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      if (field.errors['salePriceHigher']) return 'Rental price cannot be higher than purchase price';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product name',
      description: 'Description',
      categoryId: 'Category',
      basePrice: 'Purchase price',
      salePrice: 'Rental price',
      tags: 'Tags'
    };
    return labels[fieldName] || fieldName;
  }

  // Utility methods
  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  onCategorySelected($event: CategoryDto | CategoryDto[] | null) {
    const data = ($event as CategoryDto);
    this.form.patchValue({
      categoryName: data.name
    }, { emitEvent: false });

    this.updateWorkflowData();
  }
}
