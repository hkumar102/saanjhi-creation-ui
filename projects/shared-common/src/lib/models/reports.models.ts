import { InventoryStatus, ItemCondition } from './inventory.models';

export interface InventoryReportDto {
  productId: string;
  productName?: string;
  categoryId: string;
  categoryName?: string;
  size?: string;
  color?: string;
  status: InventoryStatus;
  condition: ItemCondition;
  quantity: number;
  totalAcquisitionCost: number;
  averageAcquisitionCost: number;
  totalRentalCount: number;
  totalRevenue: number;
  oldestItemDate: Date;
  newestItemDate: Date;
}

export interface ProductPerformanceReportDto {
  productId: string;
  productName?: string;
  brand?: string;
  categoryName?: string;
  rentalPrice: number;
  totalInventoryItems: number;
  availableItems: number;
  rentedItems: number;
  totalRentals: number;
  totalRentalRevenue: number;
  averageRentalPrice: number;
  utilizationRate: number;
  turnoverRate: number;
  totalAcquisitionCost: number;
  roi: number;
  daysToBreakEven: number;
  firstRentalDate?: Date;
  lastRentalDate?: Date;
  reportDate: Date;
}

export interface InventoryDashboardDto {
  totalProducts: number;
  totalInventoryItems: number;
  availableItems: number;
  rentedItems: number;
  maintenanceItems: number;
  retiredItems: number;
  totalInventoryValue: number;
  monthlyRentalRevenue: number;
  averageItemValue: number;
  overallUtilizationRate: number;
  lowStockProducts: number;
  lowActivityItems: number;
  maintenanceOverdueItems: number;
  newItemsThisMonth: number;
  retiredItemsThisMonth: number;
  topPerformingProducts?: ProductPerformanceReportDto[];
  maintenanceAlerts?: InventoryAgingReportDto[];
}

export interface InventoryAgingReportDto {
  inventoryItemId: string;
  productId: string;
  productName?: string;
  brand?: string;
  size?: string;
  color?: string;
  serialNumber?: string;
  condition: ItemCondition;
  status: InventoryStatus;
  acquisitionDate: Date;
  daysSinceAcquisition: number;
  acquisitionCost: number;
  timesRented: number;
  lastRentalDate?: Date;
  daysSinceLastRental?: number;
  lastMaintenanceDate?: Date;
  daysSinceLastMaintenance?: number;
  currentValue: number;
  agingCategory?: string;
  isLowActivity: boolean;
  needsMaintenance: boolean;
}

export interface InventoryValuationReportDto {
  productId: string;
  productName?: string;
  brand?: string;
  categoryName?: string;
  itemsByCondition?: {
    New: number;
    Excellent: number;
    Good: number;
    Fair: number;
    Poor: number;
    Damaged: number;
  };
  valueByCondition?: {
    New: number;
    Excellent: number;
    Good: number;
    Fair: number;
    Poor: number;
    Damaged: number;
  };
  totalAcquisitionCost: number;
  currentMarketValue: number;
  depreciationAmount: number;
  depreciationRate: number;
  totalItems: number;
  activeItems: number;
  retiredItems: number;
  oldestAcquisition?: Date;
  newestAcquisition?: Date;
}

export interface TrendAnalysisReportDto {
  productId: string;
  productName?: string;
  categoryId: string;
  categoryName?: string;
  period: Date;
  rentalCount: number;
  totalRevenue: number;
  averageRentalPrice: number;
  uniqueCustomers: number;
}

export interface DemandAnalysisReportDto {
  dimensionType?: string;
  dimensionValue?: string;
  totalRentals: number;
  totalRevenue: number;
  averageRentalPrice: number;
  uniqueProducts: number;
  utilizationRate: number;
  marketShare: number;
}