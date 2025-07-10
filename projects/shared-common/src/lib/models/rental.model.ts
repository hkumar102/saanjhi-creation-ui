export interface RentalDto {
  id: string;
  product: RentalProductDto;
  customer: RentalCustomerDto;
  shippingAddressId: string;
  shippingAddress?: string | null;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  securityDeposit: number;
  status?: string | null;
  height?: string | null;
  chest?: string | null;
  waist?: string | null;
  hip?: string | null;
  shoulder?: string | null;
  sleeveLength?: string | null;
  inseam?: string | null;
  notes?: string | null;
}

export interface CreateRentalCommand {
  productId: string;
  customerId: string;
  shippingAddressId: string;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  securityDeposit: number;
  height?: string | null;
  chest?: string | null;
  waist?: string | null;
  hip?: string | null;
  shoulder?: string | null;
  sleeveLength?: string | null;
  inseam?: string | null;
  notes?: string | null;
}

export interface UpdateRentalCommand extends CreateRentalCommand {
  id: string;
}

export interface RentalCustomerDto {
  id: string;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  addresses?: RentalCustomerAddressDto[];
}

export interface RentalProductDto {
  id: string;
  name?: string | null;
  description?: string | null;
  categoryName?: string | null;
  media?: RentalProductMediaDto[] | null;
}

export interface RentalCustomerAddressDto {
  id: string;
  customerId: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
}

export interface RentalProductMediaDto {
  id: string;
  url?: string | null;
}

export interface GetRentalsQuery {
  customerIds?: string[];
  productIds?: string[];
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  descending?: boolean;
  page?: number;
  pageSize?: number;
}