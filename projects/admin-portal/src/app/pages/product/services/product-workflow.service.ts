import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  ProductWorkflowState,
  WorkflowStep,
  WorkflowNavigation,
  StepValidation,
  WorkflowEvent,
  BasicInfoData,
  ProductDetailsData,
  MediaUploadData,
  InventorySetupData,
  UploadedMediaFile,
  InventoryItemData
} from '../models/product-workflow.models';
import {
  ProductServiceClient,
  ProductDto,
  CreateProductCommand,
  UpdateProductCommand,
  ToastService,
  InventoryServiceClient,
  InventoryItemDto,
  MediaServiceClient,
  AddInventoryItemCommand,
  UpdateInventoryItemCommand
} from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root'
})
export class ProductWorkflowService {

  private productService = inject(ProductServiceClient);
  private mediaService = inject(MediaServiceClient);

  private inventoryService = inject(InventoryServiceClient);

  private toast = inject(ToastService);
  private router = inject(Router);

  // Workflow state management
  private workflowState = signal<ProductWorkflowState>({
    currentStep: WorkflowStep.BASIC_INFO,
    isEditMode: false,
    isDraft: false,
    completedSteps: []
  });

  private workflowEvents$ = new BehaviorSubject<WorkflowEvent | null>(null);

  // Public observables
  readonly state = this.workflowState.asReadonly();
  readonly events$ = this.workflowEvents$.asObservable();

  // LocalStorage persistence
  private readonly LS_WORKFLOW_KEY = 'product-workflow-state';

  saveStateToLocalStorage(): void {
    try {
      const state = this.workflowState();
      const stateMedia = JSON.parse(JSON.stringify(state));
      stateMedia.mediaData = { uploadedFiles: [], isValid: state.mediaData?.isValid, existingMedia: state.mediaData?.existingMedia }; // we dont want to persist media files in localStorage
      localStorage.setItem(this.LS_WORKFLOW_KEY, JSON.stringify(stateMedia));
    } catch { }
  }

  restoreStateFromLocalStorage(): void {
    const data = localStorage.getItem(this.LS_WORKFLOW_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        parsed.mediaData = {};
        this.workflowState.set(parsed);
      } catch { }
    }
  }

  // Initialize workflow (for create or edit mode)
  async initializeWorkflow(productId?: string): Promise<void> {
    if (productId) {
      // Edit mode - load existing product
      await this.loadExistingProduct(productId);
    } else {
      // Try to restore from localStorage first
      this.restoreStateFromLocalStorage();
      // If no state, reset to initial state
      if (!this.workflowState().basicInfo) {
        this.resetWorkflow();
      }
    }
  }

  // Load existing product for editing
  private async loadExistingProduct(productId: string): Promise<void> {
    try {
      const product = await this.productService.getById(productId);

      const state: ProductWorkflowState = {
        currentStep: WorkflowStep.BASIC_INFO,
        isEditMode: true,
        productId: productId,
        isDraft: false,
        completedSteps: [],
        basicInfo: this.mapToBasicInfo(product),
        productDetails: this.mapToProductDetails(product),
        mediaData: this.mapToMediaData(product),
        inventoryData: this.mapToInventoryData(product)
      };

      this.workflowState.set(state);
      this.saveStateToLocalStorage();
      this.emitEvent({ type: 'STEP_CHANGED', step: WorkflowStep.BASIC_INFO });
      this.emitEvent({ type: 'DATA_INITIALIZED', data: state });
    } catch (error) {
      this.toast.error('Failed to load product for editing');
      this.router.navigate(['/products']);
    }
  }

  // Reset workflow to initial state
  resetWorkflow(): void {
    this.workflowState.set({
      currentStep: WorkflowStep.BASIC_INFO,
      isEditMode: false,
      isDraft: false,
      completedSteps: []
    });
    this.saveStateToLocalStorage();
    this.emitEvent({ type: 'STEP_CHANGED', step: WorkflowStep.BASIC_INFO });
  }

  // Navigate to specific step
  goToStep(step: WorkflowStep): void {
    const navigation = this.getNavigationState();

    // Validate current step before moving
    if (step > this.workflowState().currentStep && !this.validateCurrentStep().isValid) {
      this.toast.error('Please complete the current step before proceeding');
      return;
    }

    this.workflowState.update(state => ({
      ...state,
      currentStep: step
    }));

    this.emitEvent({ type: 'STEP_CHANGED', step });
  }

  // Move to next step
  goToNextStep(): void {
    const currentStep = this.workflowState().currentStep;
    const nextStep = currentStep + 1;

    if (nextStep <= WorkflowStep.REVIEW) {
      this.goToStep(nextStep as WorkflowStep);
    }
  }

  // Move to previous step
  goToPreviousStep(): void {
    const currentStep = this.workflowState().currentStep;
    const previousStep = currentStep - 1;

    if (previousStep >= WorkflowStep.BASIC_INFO) {
      this.goToStep(previousStep as WorkflowStep);
    }
  }

  // Update step data
  updateStepData(step: WorkflowStep, data: any): void {
    this.workflowState.update(state => {
      const updatedState = { ...state };
      switch (step) {
        case WorkflowStep.BASIC_INFO:
          updatedState.basicInfo = data as BasicInfoData;
          break;
        case WorkflowStep.PRODUCT_DETAILS:
          updatedState.productDetails = data as ProductDetailsData;
          break;
        case WorkflowStep.MEDIA_UPLOAD:
          updatedState.mediaData = data as MediaUploadData;
          break;
        case WorkflowStep.INVENTORY_SETUP:
          updatedState.inventoryData = data as InventorySetupData;
          break;
      }
      if (!updatedState.completedSteps.includes(step) && data.isValid) {
        updatedState.completedSteps.push(step);
      }
      return updatedState;
    });
    this.saveStateToLocalStorage();
    this.emitEvent({ type: 'DATA_UPDATED', step, data });
  }

  // Validate current step
  validateCurrentStep(): StepValidation {
    const state = this.workflowState();

    switch (state.currentStep) {
      case WorkflowStep.BASIC_INFO:
        return this.validateBasicInfo(state.basicInfo);
      case WorkflowStep.PRODUCT_DETAILS:
        return this.validateProductDetails(state.productDetails);
      case WorkflowStep.MEDIA_UPLOAD:
        return this.validateMediaUpload(state.mediaData);
      case WorkflowStep.INVENTORY_SETUP:
        return this.validateInventorySetup(state.inventoryData);
      case WorkflowStep.REVIEW:
        return this.validateReview(state);
      default:
        return { isValid: false, errors: ['Invalid step'], warnings: [] };
    }
  }

  validateStep(step: WorkflowStep): boolean {
    const state = this.workflowState();
    if (!state) return false;

    switch (step) {
      case WorkflowStep.BASIC_INFO:
        return state.basicInfo?.isValid === true;
      case WorkflowStep.PRODUCT_DETAILS:
        return state.productDetails?.isValid === true;
      case WorkflowStep.MEDIA_UPLOAD:
        return state.mediaData?.isValid === true;
      case WorkflowStep.INVENTORY_SETUP:
        return state.inventoryData?.isValid === true;
      default:
        return false;
    }
  }

  // Get navigation state
  getNavigationState(): WorkflowNavigation {
    const state = this.workflowState();
    const validation = this.validateCurrentStep();

    return {
      canGoNext: validation.isValid && state.currentStep < WorkflowStep.REVIEW,
      canGoPrevious: state.currentStep > WorkflowStep.BASIC_INFO,
      canSave: state.basicInfo !== undefined, // Can save draft if basic info exists
      canPublish: this.canPublishProduct(state)
    };
  }

  // Save as draft
  async saveDraft(): Promise<boolean> {
    try {
      await this.saveProduct();
      const state = this.workflowState();
      await this.loadExistingProduct(state.productId!);
      this.toast.success('Draft saved successfully');
      this.emitEvent({ type: 'SAVE_DRAFT', success: true });
      return true;
    } catch (error) {
      this.toast.error('Failed to save draft');
      this.emitEvent({ type: 'SAVE_DRAFT', success: false });
      throw error;
    }
  }

  private async saveMediaFiles(): Promise<void> {
    const state = this.workflowState();
    if (!state.mediaData || !state.mediaData.uploadedFiles?.length) {
      this.toast.warn('No media files to save');
      return;
    }

    try {
      const productId = state.productId || '';
      await this.uploadProductMedia(productId, state.mediaData.uploadedFiles);
      this.toast.success('Media files saved successfully');
    } catch (error) {
      throw error;
    }
  }

  private async saveProduct(): Promise<boolean> {
    try {
      const state = this.workflowState();

      if (!state.basicInfo?.isValid) {
        this.toast.error('Basic information is required to save draft');
        return false;
      }

      try {
        // Create or update product based on mode
        if (state.isEditMode && state.productId) {
          await this.updateProduct();
        } else {
          const productId = await this.createProduct();
          this.workflowState.update(s => ({ ...s, productId }));
        }
      } catch (error) {
        return false;
      }

      this.workflowState.update(s => ({
        ...s,
        isDraft: true,
        lastSaved: new Date(),
        isEditMode: true,
      }));

      try {
        await this.saveMediaFiles(); // Save media files if any
      } catch (error) {
        this.toast.error('Failed to save media files');
      }

      try {
        await this.publishInventorySetup(); // Publish inventory setup if any
      } catch (error) {
        this.toast.error('Failed to publish inventory setup');
      }
      this.saveStateToLocalStorage();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Publish product
  async publishProduct(): Promise<boolean> {
    try {
      await this.saveProduct(); // Ensure product is saved first
      const state = this.workflowState();
      await this.loadExistingProduct(state.productId!);
      if (state) {
        this.toast.success('Product published successfully');
        this.emitEvent({ type: 'PUBLISH_PRODUCT', success: true, productId: state.productId });
        //this.router.navigate(['/products/details', state.productId]);
      }

      return true;
    } catch (error) {
      this.toast.error('Failed to publish product');
      this.emitEvent({ type: 'PUBLISH_PRODUCT', success: false });
      return false;
    }
  }

  isWorkflowValid(): boolean {
    const state = this.workflowState();
    // Check if all required fields are filled
    return !!(state.basicInfo?.isValid && state.productDetails?.isValid && state.mediaData?.isValid && state.inventoryData?.isValid);
  }

  async deleteExistingMedia(mediaId: string): Promise<void> {
    try {
      await this.mediaService.delete(mediaId);
      this.toast.success('Media deleted successfully');
      // Optionally, refresh the media list or update state
    } catch (error) {
      this.toast.error('Failed to delete media');
      console.error('Delete media error:', error);
    }
  }

  // Private helper methods
  private async createProduct(): Promise<string> {
    const state = this.workflowState();

    const command: CreateProductCommand = {
      ...state.basicInfo!,
      ...state.productDetails,
      media: [] // Media will be uploaded separately
    };

    return await this.productService.create(command);
  }

  private async updateProduct(): Promise<void> {
    const state = this.workflowState();

    const command: UpdateProductCommand = {
      id: state.productId!,
      ...state.basicInfo!,
      ...state.productDetails,
      media: state.mediaData?.existingMedia || [] // Include existing media
    };

    await this.productService.update(state.productId!, command);
  }

  private async uploadProductMedia(productId: string, files: UploadedMediaFile[]): Promise<void> {
    for (const fileData of files) {
      if (fileData.uploadStatus !== 'completed' && fileData.file) {
        const mediaResult = await this.productService.uploadMedia(
          productId,
          fileData.file,
          fileData.isPrimary,
          fileData.color,
          fileData.altText,
          fileData.displayOrder
        );
        fileData.id = mediaResult.id;
        fileData.uploadStatus = 'completed';
        fileData.previewUrl = mediaResult.url;
      }
    }
  }

  // Validation methods
  private validateBasicInfo(data?: BasicInfoData): StepValidation {
    const errors: string[] = [];

    if (!data?.name?.trim()) errors.push('Product name is required');
    if (!data?.categoryId) errors.push('Category is required');
    if (!data?.purchasePrice || data.purchasePrice <= 0) errors.push('Valid purchase price is required');
    if (!data?.rentalPrice || data.rentalPrice <= 0) errors.push('Valid rental price is required');

    return { isValid: errors.length === 0, errors, warnings: [] };
  }

  private validateProductDetails(data?: ProductDetailsData): StepValidation {
    // Product details are optional, so always valid
    return { isValid: true, errors: [], warnings: [] };
  }

  private validateMediaUpload(data?: MediaUploadData): StepValidation {
    return { isValid: data?.isValid ?? false, errors: [], warnings: [] };
  }

  private validateInventorySetup(data?: InventorySetupData): StepValidation {
    const warnings: string[] = [];

    if (!data?.inventoryItems.length) {
      warnings.push('Consider adding initial inventory items');
    }

    return { isValid: true, errors: [], warnings };
  }

  private validateReview(state: ProductWorkflowState): StepValidation {
    const errors: string[] = [];

    if (!state.basicInfo) errors.push('Basic information is incomplete');

    return { isValid: errors.length === 0, errors, warnings: [] };
  }

  private canPublishProduct(state: ProductWorkflowState): boolean {
    return state.basicInfo !== undefined &&
      state.completedSteps.includes(WorkflowStep.BASIC_INFO);
  }

  // Mapping methods for edit mode
  private mapToBasicInfo(product: ProductDto): BasicInfoData {
    return {
      name: product.name || '',
      description: product.description || '',
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      rentalPrice: product.rentalPrice,
      isActive: product.isActive,
      isRentable: product.isRentable,
      isPurchasable: product.isPurchasable,
      securityDeposit: product.securityDeposit,
      maxRentalDays: product.maxRentalDays,
      categoryName: product.categoryName || '',
    };
  }

  private mapToProductDetails(product: ProductDto): ProductDetailsData {
    return {
      brand: product.brand,
      designer: product.designer,
      sku: product.sku,
      availableSizes: product.availableSizes,
      availableColors: product.availableColors,
      material: product.material,
      careInstructions: product.careInstructions,
      occasion: product.occasion,
      season: product.season
    };
  }

  private mapToMediaData(product: ProductDto): MediaUploadData {
    return {
      uploadedFiles: [], // Existing media will be handled differently
      existingMedia: product.media || [],
      isValid: product.media && product.media.length > 0
    };
  }

  private mapToInventoryData(product: ProductDto): InventorySetupData {
    return {
      inventoryItems: product.inventoryItems || [],
      isValid: product.inventoryItems && product.inventoryItems.length > 0
    };
  }

  private emitEvent(event: WorkflowEvent): void {
    this.workflowEvents$.next(event);
  }

  private publishInventorySetup() {
    const state = this.workflowState();
    if (!state.inventoryData || !state.inventoryData.inventoryItems.length) {
      this.toast.warn('No inventory items to publish');
      return;
    }

    state.inventoryData.inventoryItems.forEach(async item => {
      item.productId = state.productId || '';
      if (item.id) {
        await this.updateInventoryItem(item);
      } else {
        await this.createInventoryItem(item);
      }
    });
  }



  private async createInventoryItem(inventoryItem: InventoryItemData) {
    if (inventoryItem) {
      const newItem: AddInventoryItemCommand = { ...inventoryItem };
      const newId = await this.inventoryService.add(newItem);
      inventoryItem.id = newId;
    }
  }

  private async updateInventoryItem(inventoryItem: InventoryItemData) {
    if (inventoryItem && inventoryItem.id) {
      const updatedItem: UpdateInventoryItemCommand = {
        ...inventoryItem,
        id: inventoryItem.id!
      };
      await this.inventoryService.update(inventoryItem.id!, updatedItem);
    }
  }
}
