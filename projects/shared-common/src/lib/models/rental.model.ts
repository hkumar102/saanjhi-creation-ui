// Rental API Models (generated from latest Swagger)
export interface RentalDtoPaginatedResult {
  items?: RentalDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface RentalDto {
  id: string;
  productId: string;
  inventoryItemId: string;
  customerId: string;
  inventoryItem: RentalInventoryItemDto;
  product: RentalProductDto;
  customer: RentalCustomerDto;
  shippingAddressId: string;
  shippingAddress?: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualReturnDate?: string;
  rentalPrice: number;
  dailyRate: number;
  securityDeposit: number;
  lateFee?: number;
  damageFee?: number;
  status: RentalStatus;
  height?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeveLength?: string;
  inseam?: string;
  bookNumber: number;
  notes?: string;
  returnConditionNotes?: string;
  rentalDays: number;
  isOverdue: boolean;
  totalAmount: number;
  rentalNumber: string;
  timelines?: RentalTimelineDto[];
  measurementNotes?: string;
  bookingDate?: string;
}

export enum RentalStatus {
  Pending = 1,
  Booked = 2,
  PickedUp = 3,
  Returned = 4,
  Cancelled = 5,
  Overdue = 6
}

export interface RentalProductDto {
  id: string;
  name?: string;
  description?: string;
  categoryName?: string;
  media?: RentalProductMediaDto[];
  mainImage?: RentalProductMediaDto;
  sku: string;
}

export interface RentalProductMediaDto {
  id: string;
  url?: string;
}

export interface RentalCustomerDto {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  addresses?: RentalCustomerAddressDto[];
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

export interface CreateRentalCommand {
  productId: string;
  inventoryItemId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  dailyRate: number;
  securityDeposit: number;
  shippingAddressId: string;
  bookNumber: number;
  notes?: string;
  height?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeveLength?: string;
  inseam?: string;
  rentalNumber?: string;
  actualStartDate?: Date;
  actualReturnDate?: Date;
  lateFee?: number;
  damageFee?: number;
  returnConditionNotes?: string;
  bookingDate?: string;
  status?: RentalStatus;
}

export interface UpdateRentalCommand {
  id: string;
  productId: string;
  inventoryItemId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualReturnDate?: string;
  rentalPrice: number;
  dailyRate: number;
  securityDeposit: number;
  shippingAddressId: string;
  bookNumber: number;
  notes?: string;
  height?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeveLength?: string;
  inseam?: string;
  lateFee?: number;
  damageFee?: number;
  returnConditionNotes?: string;
  bookingDate?: string;
  status: RentalStatus;
}

export interface GetRentalsQuery {
  customerIds?: string[];
  productIds?: string[];
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  descending?: boolean;
  page: number;
  pageSize: number;
  status?: RentalStatus;
  bookingFromDate?: string;
  bookingToDate?: string;
}

export const RentalStatusOptions = [
  { label: 'Pending', value: RentalStatus.Pending },
  { label: 'Booked', value: RentalStatus.Booked },
  { label: 'Picked Up / Delivered', value: RentalStatus.PickedUp },
  { label: 'Returned', value: RentalStatus.Returned },
  { label: 'Cancelled', value: RentalStatus.Cancelled },
  { label: 'Overdue', value: RentalStatus.Overdue }
];

export interface UpdateRentalStatusCommand {
  id: string;
  status: RentalStatus;
  notes?: string;
  actualStartDate?: string;
  actualReturnDate?: string;
}

export interface RentalInventoryItemDto {
  size: string;
  color: string;
  barcodeImageBase64?: string;
  qrCodeImageBase64?: string;
  serialNumber?: string;
}

export interface RentalTimelineDto {
  id: string;
  rentalId: string;
  changedAt: string; // ISO date string
  status: number;
  changedByUserId: string;
  notes?: string;
}

export interface RentalRevenueReportDto {
  totalRevenue: number;
  revenueByCategory?: { [category: string]: number | null };
  revenueByProduct?: { [product: string]: number | null };
  rentalCount: number;
}

export interface RentalProfitReportDto {
  totalProfit: number;
  totalRevenue: number;
  totalCost: number;
  profitByCategory?: { [category: string]: number | null };
  profitByProduct?: { [product: string]: number | null };
}

export interface RentalsActivityReportDto {
  totalRentals: number;
  activeRentals: number;
  returnedRentals: number;
  overdueRentals: number;
  cancelledRentals: number;
  rentalsByProduct?: { [product: string]: number | null };
  rentalsByCustomer?: { [customer: string]: number | null };
}

export interface RentalDashboardReportDto {
  totalEarning: number;
  totalSecurityDeposit: number;
  totalRentals: number;
  averageRentalPrice: number;
  listOfRentals: RentalDto[];
  listProductsGrouped: ProductRentalSummaryDto[];
}

export interface ProductRentalSummaryDto {
  productId: string;
  productName: string;
  totalRentalAmount: number;
  totalRentalCount: number;
}