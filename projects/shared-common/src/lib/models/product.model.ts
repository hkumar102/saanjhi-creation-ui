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
  search?: string;
  categoryId?: string;
  isRentable?: boolean;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRentalPrice?: number;
  maxRentalPrice?: number;
  page?: number;
  pageSize?: number;
}