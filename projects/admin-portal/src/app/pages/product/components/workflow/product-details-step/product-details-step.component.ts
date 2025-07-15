import { Component, OnInit, OnDestroy, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductWorkflowService } from '../../../services/product-workflow.service';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';
import {
    UiInputComponent,
    UiTextareaComponent,
    UiFormControlComponent,
    UiDropdownComponent,
    UiChipsComponent,
    UiCheckboxComponent
} from '@saanjhi-creation-ui/shared-ui';
import { AvailableColors, AvailableSizes } from '@saanjhi-creation-ui/shared-common';

@Component({
    selector: 'app-product-details-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        DropdownModule,
        FloatLabelModule,
        DividerModule,
        UiInputComponent,
        UiTextareaComponent,
        UiFormControlComponent,
        UiDropdownComponent,
        UiCheckboxComponent
    ],
    templateUrl: './product-details-step.component.html',
    styleUrls: ['./product-details-step.component.scss']
})
export class ProductDetailsStepComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private workflowService = inject(ProductWorkflowService);
    private destroy$ = new Subject<void>();

    // Form
    @Input() detailsForm!: FormGroup;
    isSubmitting = signal(false);

    // Selected values for multi-select options
    selectedSizes = signal<string[]>([]);
    selectedColors = signal<string[]>([]);

    // Dropdown options
    occasionOptions = signal([
        { label: 'Casual', value: 'Casual' },
        { label: 'Formal', value: 'Formal' },
        { label: 'Party', value: 'Party' },
        { label: 'Wedding', value: 'Wedding' },
        { label: 'Work', value: 'Work' },
        { label: 'Sports', value: 'Sports' },
        { label: 'Evening', value: 'Evening' },
        { label: 'Beach', value: 'Beach' },
        { label: 'Travel', value: 'Travel' },
        { label: 'Festival', value: 'Festival' }
    ]);

    seasonOptions = signal([
        { label: 'Spring', value: 'Spring' },
        { label: 'Summer', value: 'Summer' },
        { label: 'Autumn', value: 'Autumn' },
        { label: 'Winter', value: 'Winter' },
        { label: 'All Season', value: 'All Season' }
    ]);

    availableSizes = AvailableSizes;
    availableColors = AvailableColors;

    ngOnInit(): void {
        this.loadExistingData();
        this.subscribeToFormChanges();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadExistingData(): void {
        const workflowState = this.workflowService.state();
        const productDetails = workflowState.productDetails;

        if (productDetails) {
            this.detailsForm.patchValue(productDetails);

            // Load existing selections for sizes and colors
            if (productDetails.availableSizes) {
                this.selectedSizes.set(productDetails.availableSizes);
            }
            if (productDetails.availableColors) {
                this.selectedColors.set(productDetails.availableColors);
            }

            this.detailsForm.markAsUntouched();
            this.detailsForm.markAsPristine();
            this.detailsForm.updateValueAndValidity();
            // Show validation errors for invalid fields on page load
            Object.keys(this.detailsForm.controls).forEach(key => {
                const control = this.detailsForm.get(key);
                if (control && control.invalid) {
                    control.markAsTouched();
                    control.markAsDirty();
                }
            });

            this.workflowService.updateStepData(this.workflowService.state().currentStep, { ...productDetails, isValid: this.detailsForm.valid });

        }
    }

    private subscribeToFormChanges(): void {
        this.detailsForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(formData => {
                const data = {
                    ...formData,
                    isValid: this.detailsForm.valid
                };
                this.workflowService.updateStepData(this.workflowService.state().currentStep, data);
            });
    }

    // Form validation methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.detailsForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.detailsForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
            if (field.errors['max']) return `${fieldName} must be less than ${field.errors['max'].max}`;
            if (field.errors['pattern']) return `${fieldName} format is invalid`;
        }
        return '';
    }

    // Utility methods
    onSizeChange(isChecked: boolean, size: string): void {
        const currentSizes = this.selectedSizes();
        if (isChecked && !currentSizes.includes(size)) {
            this.selectedSizes.set([...currentSizes, size]);
        } else if (!isChecked && currentSizes.includes(size)) {
            this.selectedSizes.set(currentSizes.filter(s => s !== size));
        }

        // Update form control
        this.detailsForm.patchValue({ availableSizes: this.selectedSizes() });
    }

    onColorChange(isChecked: boolean, color: string): void {
        const currentColors = this.selectedColors();
        if (isChecked && !currentColors.includes(color)) {
            this.selectedColors.set([...currentColors, color]);
        } else if (!isChecked && currentColors.includes(color)) {
            this.selectedColors.set(currentColors.filter(c => c !== color));
        }

        // Update form control
        this.detailsForm.patchValue({ availableColors: this.selectedColors() });
    }

    onBrandChange(brand: string): void {
        console.log('Brand changed:', brand);
    }

    // Validation for step completion
    isStepValid(): boolean {
        return this.detailsForm.valid;
    }

    // Get form data for saving
    getFormData() {
        return this.detailsForm.value;
    }

    // Check if a size is selected
    isSizeSelected(size: string): boolean {
        return this.selectedSizes().includes(size);
    }

    // Check if a color is selected
    isColorSelected(color: string): boolean {
        return this.selectedColors().includes(color);
    }
}
