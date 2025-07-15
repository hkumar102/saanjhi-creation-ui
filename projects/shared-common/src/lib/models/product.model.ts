import { InventoryItemDto } from "./inventory.models";

// New media variant interfaces based on swagger
export interface MediaVariantDto {
  url?: string;
  width: number;
  height: number;
  fileSize: number;
  format?: string;
  usage?: string;
}

export interface MediaVariantsDto {
  thumbnail?: MediaVariantDto;
  small?: MediaVariantDto;
  medium?: MediaVariantDto;
  large?: MediaVariantDto;
  original?: MediaVariantDto;
}

// Updated ProductMediaDto to match swagger
export interface ProductMediaDto {
  id: string;
  mediaId: string;
  url?: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  displayOrder: number;
  originalFileName?: string;
  contentType?: string;
  fileSize: number;
  width: number;
  height: number;
  altText?: string;
  color?: string;
  uploadedAt: Date;
  processingStatus?: string;
  variants?: MediaVariantsDto;
  publicId?: string;
  mediaType: number;
  sortOrder: number;
  size?: string;
  isGeneric: boolean;
  mediaPurpose?: string;
}

export interface ProductDto {
  id: string;
  name?: string;
  description?: string;
  brand?: string;
  designer?: string;
  sku?: string;
  purchasePrice: number;
  rentalPrice: number;
  securityDeposit?: number;
  maxRentalDays: number;
  availableSizes?: string[];
  availableColors?: string[];
  material?: string;
  careInstructions?: string;
  occasion?: string;
  season?: string;
  isActive: boolean;
  isRentable: boolean;
  isPurchasable: boolean;
  categoryId: string;
  categoryName?: string;
  media?: ProductMediaDto[];
  inventoryItems?: InventoryItemDto[];
  mediaByColor?: Record<string, ProductMediaDto[]>;
  genericMedia?: ProductMediaDto[];
  totalInventoryCount: number;
  availableInventoryCount: number;
  availableColorsWithMedia?: string[];
  mainImage?: ProductMediaDto;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetAllProductsQuery {
  search?: string;
  categoryIds?: string[];
  isRentable?: boolean;
  isPurchasable?: boolean;
  isActive?: boolean;
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
  minRentalPrice?: number;
  maxRentalPrice?: number;
  brand?: string;
  designer?: string;
  sizes?: string[];
  colors?: string[];
  material?: string;
  occasion?: string;
  season?: string;
  hasAvailableInventory?: boolean;
  minAvailableQuantity?: number;
  sortBy?: string;
  sortDesc: boolean;
  page: number;
  pageSize: number;
  includeMedia: boolean;
  includeInventory: boolean;
  organizeMediaByColor: boolean;
}

export interface GetProductsByIdsQuery {
  productIds?: string[];
}

export interface ProductDtoPaginatedResult {
  items?: ProductDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateProductCommand {
  name?: string;
  description?: string;
  brand?: string;
  designer?: string;
  purchasePrice: number;
  rentalPrice: number;
  securityDeposit?: number;
  maxRentalDays: number;
  availableSizes?: string[];
  availableColors?: string[];
  material?: string;
  careInstructions?: string;
  occasion?: string;
  season?: string;
  isActive: boolean;
  isRentable: boolean;
  isPurchasable: boolean;
  categoryId: string;
  media?: ProductMediaDto[];
}

export interface UpdateProductCommand {
  id: string;
  name?: string;
  description?: string;
  brand?: string;
  designer?: string;
  sku?: string;
  purchasePrice: number;
  rentalPrice: number;
  securityDeposit?: number;
  maxRentalDays: number;
  availableSizes?: string[];
  availableColors?: string[];
  material?: string;
  careInstructions?: string;
  occasion?: string;
  season?: string;
  isActive: boolean;
  isRentable: boolean;
  isPurchasable: boolean;
  categoryId: string;
  media?: ProductMediaDto[];
}

export interface AddProductMediaCommand {
  productId: string;
  url?: string;
  mediaType?: string;
  color?: string;
  sortOrder: number;
  isGeneric: boolean;
  altText?: string;
}

export const AvailableSizes = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '28', '30', '32', '34', '36', '38', '40', '42', '44',
  '4', '6', '8', '10', '12', '14', '16', '18', '20',
  'One Size', 'Free Size', 'Custom'
];

export const AvailableColors = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown',
  'Gray', 'Beige', 'Navy', 'Maroon', 'Olive', 'Teal', 'Turquoise', 'Gold', 'Silver',
  'Multicolor', 'Custom'
];