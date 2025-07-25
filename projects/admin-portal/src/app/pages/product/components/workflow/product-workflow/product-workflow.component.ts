import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs';
import { WorkflowStep, WorkflowNavigation, WorkflowEvent } from '../../../models/product-workflow.models';
import { BasicInfoStepComponent } from '../basic-info-step/basic-info-step.component';
import { ProductDetailsStepComponent } from '../product-details-step/product-details-step.component';
import { MediaUploadStepComponent } from '../media-upload-step/media-upload-step.component';
import { InventorySetupStepComponent } from '../inventory-setup-step/inventory-setup-step.component';

// PrimeNG Imports
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { ReviewPublishStepComponent } from '../review-publish-step/review-publish-step.component';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { BaseProductFlowComponent } from '../../base-product-flow.component';
import { CardModule } from 'primeng/card';

function securityDepositValidator(control: FormControl): ValidationErrors | null {
  const purchasePrice = control.parent?.get('purchasePrice')?.value;
  const rentalPrice = control.parent?.get('rentalPrice')?.value;
  const securityDeposit = control.value

  if (securityDeposit == null || purchasePrice == null || rentalPrice == null) {
    return null;
  }

  if (securityDeposit < rentalPrice) {
    return { securityDepositTooLow: true };
  }
  if (securityDeposit >= 2 * purchasePrice) {
    return { securityDepositTooHigh: true };
  }
  return null;
}

export function requiredArray(control: AbstractControl): ValidationErrors | null {
  return (control instanceof FormArray && control.length > 0) ? null : { required: true };
}

@Component({
  selector: 'app-product-workflow',
  standalone: true,
  imports: [
    CommonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    ButtonModule,
    BasicInfoStepComponent,
    ProductDetailsStepComponent,
    MediaUploadStepComponent,
    InventorySetupStepComponent,
    StepperModule,
    ReviewPublishStepComponent,
    StepperModule,
    CardModule
  ],
  templateUrl: './product-workflow.component.html',
  styleUrls: ['./product-workflow.component.scss']
})
export class ProductWorkflowComponent extends BaseProductFlowComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Expose WorkflowStep enum to template
  readonly WorkflowStep = WorkflowStep;

  // Component state
  isLoading = signal(false);
  productId = signal<string | undefined>(undefined);
  isValid = signal(false);
  currentStep = computed(() => {
    const currentStep = this.workflowState().currentStep;
    return this.steps.find(step => step.step === currentStep) ?? this.steps[0];
  });

  // Workflow state from service
  readonly workflowState = this.workflowService.state;

  // Navigation state
  navigation = signal<WorkflowNavigation>({
    canGoNext: false,
    canGoPrevious: false,
    canSave: false,
    canPublish: false
  });

  // Step configuration
  readonly steps = [
    {
      step: WorkflowStep.BASIC_INFO,
      label: 'Basic Info',
      description: 'Product name, category, and pricing',
      icon: 'fa-shirt',
      id: 1
    },
    {
      step: WorkflowStep.PRODUCT_DETAILS,
      label: 'Product Details',
      description: 'Brand, size, color, and specifications',
      icon: 'fa-info',
      id: 2
    },
    {
      step: WorkflowStep.MEDIA_UPLOAD,
      label: 'Media Upload',
      description: 'Product images and videos',
      icon: 'fa-images',
      id: 3
    },
    {
      step: WorkflowStep.INVENTORY_SETUP,
      label: 'Inventory Setup',
      description: 'Stock levels and availability',
      icon: 'fa-boxes-stacked',
      id: 4
    },
    {
      step: WorkflowStep.REVIEW,
      label: 'Review & Publish',
      description: 'Review all details and publish',
      icon: 'fa-upload',
      id: 5
    }
  ];

  // One FormGroup per step
  basicInfoForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(1000)]],
    categoryId: ['', [Validators.required]],
    categoryName: ['', [Validators.required]],
    purchasePrice: [null, [Validators.required, Validators.min(1)]],
    rentalPrice: [null, [Validators.required, Validators.min(1)]],
    isActive: [true],
    isPurchasable: [true],
    isRentable: [true],
    securityDeposit: [null, [Validators.required, Validators.min(1), securityDepositValidator]],
    maxRentalDays: [null, [Validators.required, Validators.min(1), Validators.max(365)]],
    tags: [[]] // Array for chips component
  });
  productDetailsForm: FormGroup = this.fb.group({
    // Brand and Design
    brand: ['Saanjhi Creation', [Validators.required]],
    designer: ['Neelam', [Validators.required]],

    // Availability Options
    availableSizes: [[], [Validators.required]],
    availableColors: [[], [Validators.required]],

    // Material and Care
    material: ['', [Validators.required]],
    careInstructions: ['', [Validators.required]],

    // Styling
    occasion: [[], [Validators.required]],
    season: ['', [Validators.required]]
  });
  mediaUploadForm: FormGroup = this.fb.group(
    {
      uploadedFiles: new FormArray([], requiredArray)
    }
  );
  inventorySetupForm: FormGroup = this.fb.group({
    inventoryItems: new FormArray([], requiredArray)
  });

  protected override onWorkFlowEvent(event: WorkflowEvent | null): void {
    if (event?.type === 'PUBLISH_PRODUCT') {
      // Handle publish event if needed
      const mediaFilesFormArray = this.mediaUploadForm.controls['uploadedFiles'] as FormArray;

      mediaFilesFormArray.reset();
      mediaFilesFormArray.updateValueAndValidity();
      this.mediaUploadForm.reset();
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.workflowService.resetWorkflow();
    this.initializeWorkflow();
    this.subscribeToWorkflowEvents();
    this.updateNavigation();
  }

  private async initializeWorkflow(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Get product ID from route params if editing
      const productId = this.route.snapshot.paramMap.get('id');
      this.productId.set(productId || undefined);
      // Initialize workflow service
      await this.workflowService.initializeWorkflow(productId || undefined);

    } catch (error) {
      console.error('Failed to initialize workflow:', error);
      this.router.navigate(['/products']);
    } finally {
      this.isLoading.set(false);
    }
  }

  private subscribeToWorkflowEvents(): void {
    this.workflowService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event) {
          this.handleWorkflowEvent(event);
          this.isValid.set(this.workflowService.isWorkflowValid());
        }
      });
  }

  private handleWorkflowEvent(event: any): void {
    switch (event.type) {
      case 'STEP_CHANGED':
        this.updateNavigation();
        break;
      case 'DATA_UPDATED':
        this.updateNavigation();
        break;
      case 'PUBLISH_PRODUCT':
        if (event.success) {
          this.router.navigate(['/products/list']);
        }
        break;
    }
  }

  private updateNavigation(): void {
    this.navigation.set(this.workflowService.getNavigationState());
  }

  // Step navigation methods
  getCurrentStepIndex(): number {
    const currentStep = this.workflowState().currentStep;
    return this.steps.findIndex(step => step.step === currentStep);
  }

  goToStep(step: WorkflowStep): void {
    this.workflowService.goToStep(step);
  }

  goToNextStep(): void {
    this.workflowService.goToNextStep();
  }

  goToPreviousStep(): void {
    this.workflowService.goToPreviousStep();
  }

  // Action methods
  async saveDraft(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.workflowService.saveDraft();
    } finally {
      this.isLoading.set(false);
    }
  }

  async publishProduct(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.workflowService.publishProduct();
    } finally {
      this.isLoading.set(false);
    }
  }

  // Utility methods
  isStepInvalid(step: WorkflowStep): boolean {
    switch (step) {
      case WorkflowStep.BASIC_INFO:
        return this.workflowState().basicInfo?.isValid === false;
      case WorkflowStep.PRODUCT_DETAILS:
        return this.workflowState().productDetails?.isValid === false;
      case WorkflowStep.MEDIA_UPLOAD:
        return this.workflowState().mediaData?.isValid === false;
      case WorkflowStep.INVENTORY_SETUP:
        return this.workflowState().inventoryData?.isValid === false;
    }
    return false;
  }

  isStepCompleted(step: WorkflowStep): boolean {
    return this.workflowState().completedSteps.includes(step);
  }

  isStepActive(step: WorkflowStep): boolean {
    return this.workflowState().currentStep === step;
  }

  isStepAccessible(step: WorkflowStep): boolean {
    const state = this.workflowState();
    // In edit mode, all steps are accessible
    if (state.isEditMode) {
      return true;
    }
    // In create mode, steps are accessible if previous steps are completed
    return step <= state.currentStep || this.isStepCompleted(step);
  }

  getStepStatus(step: WorkflowStep): 'completed' | 'active' | 'pending' | 'disabled' | 'invalid' {
    if (this.isStepInvalid(step)) return 'invalid';
    if (this.isStepCompleted(step)) return 'completed';
    if (this.isStepActive(step)) return 'active';
    if (this.isStepAccessible(step)) return 'pending';
    return 'disabled';
  }

  getStepClasses(step: WorkflowStep): string {
    const status = this.getStepStatus(step);
    //const baseClasses = 'inline-flex align-items-center justify-content-center border-circle w-3rem h-3rem cursor-pointer transition-colors transition-duration-200';
    const baseClasses = '';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 text-white border-2 border-green-500`;
      case 'active':
        return `${baseClasses} text-primary-contrast border-2 border-primary`;
      case 'pending':
        return `${baseClasses} p-button-secondary`;
      case 'disabled':
        return `${baseClasses} bg-surface-200 text-surface-500 border-2 border-surface-300 cursor-not-allowed`;
      case 'invalid':
        return `${baseClasses} bg-surface-200 text-surface-500 border-2 border-red-500 bg-red-500 text-white`;
      default:
        return baseClasses;
    }
  }

  // Cancel workflow
  cancelWorkflow(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/products']);
    }
  }
  
}
