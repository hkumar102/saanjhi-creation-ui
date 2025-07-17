import { InventoryStatus, ItemCondition, ProductMediaDto } from "@saanjhi-creation-ui/shared-common";

// Workflow step definitions
export enum WorkflowStep {
  BASIC_INFO = 1,
  PRODUCT_DETAILS = 2,
  MEDIA_UPLOAD = 3,
  INVENTORY_SETUP = 4,
  REVIEW = 5
}

// Workflow state interface
export interface ProductWorkflowState {
  currentStep: WorkflowStep;
  isEditMode: boolean;
  productId?: string;
  isDraft: boolean;
  lastSaved?: Date;
  completedSteps: WorkflowStep[];
  basicInfo?: BasicInfoData;
  productDetails?: ProductDetailsData;
  mediaData?: MediaUploadData;
  inventoryData?: InventorySetupData;
}

// Step 1: Basic Information
export interface BasicInfoData {
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  purchasePrice: number;
  rentalPrice: number;
  isActive: boolean;
  isRentable: boolean;
  isPurchasable: boolean;
  securityDeposit?: number;
  maxRentalDays: number;
  tags?: string[]; // Array for chips component
  isValid?: boolean; // Optional field for validation
}

// Step 2: Product Details  
export interface ProductDetailsData {
  brand?: string;
  designer?: string;
  sku?: string;
  availableSizes?: string[];
  availableColors?: string[];
  material?: string;
  careInstructions?: string;
  occasion?: string[];
  season?: string;
  isValid?: boolean; // Optional field for validation
}

// Step 3: Media Upload
export interface MediaUploadData {
  uploadedFiles: UploadedMediaFile[];
  isValid?: boolean; // Optional field for validation
  existingMedia?: ProductMediaDto[]; // Existing media from product details
}

export interface UploadedMediaFile {
  id?: string;
  file?: File;
  previewUrl?: string;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadProgress?: number;
  color?: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

// Step 4: Inventory Setup
export interface InventorySetupData {
  inventoryItems: InventoryItemData[];
  isValid?: boolean; // Optional field for validation
}

export interface InventoryItemData {
  id?: string;
  productId: string;
  size?: string;
  color?: string;
  condition: ItemCondition;
  status: InventoryStatus;
  acquisitionDate: Date;
  acquisitionCost: number;
  serialNumber?: string;
  conditionNotes?: string;
  warehouseLocation?: string;
  isRetired?: boolean;
  retirementReason?: string;
  retirementDate?: Date;
}

// Workflow navigation
export interface WorkflowNavigation {
  canGoNext: boolean;
  canGoPrevious: boolean;
  canSave: boolean;
  canPublish: boolean;
}

// Step validation results
export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Workflow events
export type WorkflowEvent =
  { type: 'DATA_INITIALIZED', data: ProductWorkflowState }
  | { type: 'STEP_CHANGED'; step: WorkflowStep }
  | { type: 'DATA_UPDATED'; step: WorkflowStep; data: any }
  | { type: 'VALIDATION_FAILED'; step: WorkflowStep; errors: string[] }
  | { type: 'SAVE_DRAFT'; success: boolean }
  | { type: 'PUBLISH_PRODUCT'; success: boolean; productId?: string };
