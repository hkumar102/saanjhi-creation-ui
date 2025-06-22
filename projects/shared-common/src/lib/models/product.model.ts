
/**
 * DTO representing a product returned by the API.
 */
export interface ProductDto {
  id: string;
  name: string;
  price: number;
  rentalPrice: number;
  inStock: boolean;
  isRental: boolean;
  categoryName: string;
  imageUrls: string[];
}

/**
 * Model used for binding product form data before submission.
 */
export interface ProductFormModel {
  name: string;
  price: number;
  rentalPrice: number;
  inStock: boolean;
  isRental: boolean;
  categoryId: string;
  images: File[]; // Angular equivalent of IFormFile[]
}

/**
 * Model used for patching product fields via JSON Patch.
 * All fields are optional to support partial updates.
 */
export interface PatchProductFormModel {
  name?: string;
  price?: number;
  rentalPrice?: number;
  inStock?: boolean;
  isRental?: boolean;
  categoryId?: string;
}