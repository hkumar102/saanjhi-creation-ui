export interface ProductMediaDto {
  id: string;
  url?: string;
  publicId?: string;
  mediaType: number;
}

export interface ProductDto {
  id: string;
  name?: string;
  description?: string;
  price: number;
  quantity: number;
  isActive: boolean;
  isRentable: boolean;
  rentalPrice?: number;
  securityDeposit?: number;
  maxRentalDays?: number;
  categoryId: string;
  categoryName?: string;
  media?: ProductMediaDto[];
}

export interface CreateProductCommand {
  name?: string;
  description?: string;
  price: number;
  quantity: number;
  isActive: boolean;
  isRentable: boolean;
  rentalPrice?: number;
  securityDeposit?: number;
  maxRentalDays?: number;
  categoryId: string;
  media?: ProductMediaDto[];
}

export interface UpdateProductCommand extends CreateProductCommand {
  id: string;
}

export interface ProductFilter {
  Search?: string;
  CategoryId?: string;
  IsRentable?: boolean;
  IsActive?: boolean;
  MinPrice?: number;
  MaxPrice?: number;
  MinRentalPrice?: number;
  MaxRentalPrice?: number;
  Page?: number;
  PageSize?: number;
}