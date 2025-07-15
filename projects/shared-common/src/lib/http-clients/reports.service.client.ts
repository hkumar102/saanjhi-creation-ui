import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { 
  InventoryReportDto, 
  ProductPerformanceReportDto, 
  InventoryDashboardDto, 
  InventoryAgingReportDto, 
  InventoryValuationReportDto, 
  TrendAnalysisReportDto, 
  DemandAnalysisReportDto 
} from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root',
})
export class ReportsServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.productServiceBaseUrl}/Reports`;
  private http = inject(HttpClient);

  getInventoryReport(categoryIds?: string[], includeRetired = false): Promise<InventoryReportDto[]> {
    let params = new HttpParams();
    if (categoryIds?.length) {
      categoryIds.forEach(id => params = params.append('categoryIds', id));
    }
    params = params.append('includeRetired', includeRetired.toString());
    
    return lastValueFrom(this.http.get<InventoryReportDto[]>(`${this.baseUrl}/inventory`, { params }));
  }

  getProductPerformance(categoryIds?: string[]): Promise<ProductPerformanceReportDto[]> {
    let params = new HttpParams();
    if (categoryIds?.length) {
      categoryIds.forEach(id => params = params.append('categoryIds', id));
    }
    
    return lastValueFrom(this.http.get<ProductPerformanceReportDto[]>(`${this.baseUrl}/product-performance`, { params }));
  }

  getDashboard(fromDate?: Date, toDate?: Date): Promise<InventoryDashboardDto> {
    let params = new HttpParams();
    if (fromDate) params = params.append('fromDate', fromDate.toISOString());
    if (toDate) params = params.append('toDate', toDate.toISOString());
    
    return lastValueFrom(this.http.get<InventoryDashboardDto>(`${this.baseUrl}/dashboard`, { params }));
  }

  getAging(categoryIds?: string[], maintenanceThresholdDays = 180, lowActivityThresholdDays = 90, includeRetired = false): Promise<InventoryAgingReportDto[]> {
    let params = new HttpParams();
    if (categoryIds?.length) {
      categoryIds.forEach(id => params = params.append('categoryIds', id));
    }
    params = params.append('maintenanceThresholdDays', maintenanceThresholdDays.toString());
    params = params.append('lowActivityThresholdDays', lowActivityThresholdDays.toString());
    params = params.append('includeRetired', includeRetired.toString());
    
    return lastValueFrom(this.http.get<InventoryAgingReportDto[]>(`${this.baseUrl}/aging`, { params }));
  }

  getValuation(categoryIds?: string[], productIds?: string[], includeRetired = false, asOfDate?: Date): Promise<InventoryValuationReportDto[]> {
    let params = new HttpParams();
    if (categoryIds?.length) {
      categoryIds.forEach(id => params = params.append('categoryIds', id));
    }
    if (productIds?.length) {
      productIds.forEach(id => params = params.append('productIds', id));
    }
    params = params.append('includeRetired', includeRetired.toString());
    if (asOfDate) params = params.append('asOfDate', asOfDate.toISOString());
    
    return lastValueFrom(this.http.get<InventoryValuationReportDto[]>(`${this.baseUrl}/valuation`, { params }));
  }

  getTrends(categoryIds?: string[], fromDate?: Date, toDate?: Date, groupBy = 'month'): Promise<TrendAnalysisReportDto[]> {
    let params = new HttpParams();
    if (categoryIds?.length) {
      categoryIds.forEach(id => params = params.append('categoryIds', id));
    }
    if (fromDate) params = params.append('fromDate', fromDate.toISOString());
    if (toDate) params = params.append('toDate', toDate.toISOString());
    params = params.append('groupBy', groupBy);
    
    return lastValueFrom(this.http.get<TrendAnalysisReportDto[]>(`${this.baseUrl}/trends`, { params }));
  }

  getDemandAnalysis(categoryIds?: string[], fromDate?: Date, toDate?: Date, analysisType = 'all'): Promise<DemandAnalysisReportDto[]> {
    let params = new HttpParams();
    if (categoryIds?.length) {
      categoryIds.forEach(id => params = params.append('categoryIds', id));
    }
    if (fromDate) params = params.append('fromDate', fromDate.toISOString());
    if (toDate) params = params.append('toDate', toDate.toISOString());
    params = params.append('analysisType', analysisType);
    
    return lastValueFrom(this.http.get<DemandAnalysisReportDto[]>(`${this.baseUrl}/demand`, { params }));
  }
}