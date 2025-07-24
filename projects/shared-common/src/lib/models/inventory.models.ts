import { ProductMediaDto } from "./product.model";

export interface InventoryItemDto {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  serialNumber?: string;
  barcodeImageBase64?: string;
  status: InventoryStatus;
  condition: ItemCondition;
  conditionNotes?: string;
  timesRented: number;
  acquisitionDate: Date;
  acquisitionCost: number;
  lastRentedDate?: Date;
  lastMaintenanceDate?: Date;
  warehouseLocation?: string;
  storageNotes?: string;
  retirementDate?: Date;
  retirementReason?: string;
  isRetired: boolean;
  productName?: string;
  productBrand?: string;
  isAvailable: boolean;
  daysSinceLastRented: number;
  qrCodeImageBase64?: string;
  availableSizes?: string[];
  availableColors?: string[];
  media?: ProductMediaDto[];
}

export enum InventoryStatus {
  Available = 1,

  /// <summary>
  /// Item is currently rented out
  /// </summary>
  Rented = 2,

  /// <summary>
  /// Item is being cleaned after return
  /// </summary>
  Cleaning = 3,

  /// <summary>
  /// Item is under maintenance/repair
  /// </summary>
  Maintenance = 4,

  /// <summary>
  /// Item is damaged and cannot be rented
  /// </summary>
  Damaged = 5,

  /// <summary>
  /// Item is reserved for a future rental
  /// </summary>
  Reserved = 6,

  /// <summary>
  /// Item is in transit (shipping/receiving)
  /// </summary>
  InTransit = 7,

  /// <summary>
  /// Item is being inspected for quality
  /// </summary>
  Inspection = 8,

  /// <summary>
  /// Item is retired from service
  /// </summary>
  Retired = 9
}

export const InventoryStatusOptions = [
  { label: 'Available', value: InventoryStatus.Available },
  { label: 'Rented', value: InventoryStatus.Rented },
  { label: 'Cleaning', value: InventoryStatus.Cleaning },
  { label: 'Maintenance', value: InventoryStatus.Maintenance },
  { label: 'Damaged', value: InventoryStatus.Damaged },
  { label: 'Retired', value: InventoryStatus.Retired },
  { label: 'Reserved', value: InventoryStatus.Reserved },
  { label: 'In Transit', value: InventoryStatus.InTransit },
  { label: 'Inspection', value: InventoryStatus.Inspection }];

export enum ItemCondition {
  New = 1,
  Excellent = 2,
  Good = 3,
  Fair = 4,
  Poor = 5,
  Damaged = 6
}

export const itemConditionOptions = [
  { label: 'New', value: ItemCondition.New },
  { label: 'Excellent', value: ItemCondition.Excellent },
  { label: 'Good', value: ItemCondition.Good },
  { label: 'Fair', value: ItemCondition.Fair },
  { label: 'Poor', value: ItemCondition.Poor },
  { label: 'Damaged', value: ItemCondition.Damaged }
];

export interface AddInventoryItemCommand {
  productId: string;
  size?: string;
  color?: string;
  condition: ItemCondition;
  acquisitionCost: number;
  acquisitionDate: Date;
  conditionNotes?: string;
  warehouseLocation?: string;
}

export interface UpdateInventoryItemCommand {
  id: string;
  size?: string;
  color?: string;
  condition: ItemCondition;
  acquisitionCost: number;
  acquisitionDate: Date;
  conditionNotes?: string;
  warehouseLocation?: string;
  isRetired?: boolean;
  retirementReason?: string;
  retirementDate?: Date;
  status?: InventoryStatus;
}

export interface UpdateInventoryStatusCommand {
  inventoryItemId: string;
  status: InventoryStatus;
  conditionNotes?: string;
}

export interface SearchInventoryQuery {
  page?: number;
  pageSize?: number;
  size?: string;
  color?: string;
  status?: InventoryStatus;
  condition?: ItemCondition;
  includeRetired?: boolean;
  sortBy?: string;
  sortDesc?: boolean;
  productId?: string;
  productIds?: string[];
  acquisitionCostMin?: number;
  acquisitionCostMax?: number;
}

export const DEFAULT_INVENTORY_CONSTANTS = {
  WAREHOUSE_LOCATION: 'Palam',
  CONDITION: 1, // Default condition set to 'New'
}