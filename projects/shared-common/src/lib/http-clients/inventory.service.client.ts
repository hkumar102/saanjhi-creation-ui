import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { InventoryItemDto, AddInventoryItemCommand, UpdateInventoryStatusCommand, UpdateInventoryItemCommand, SearchInventoryQuery, PaginatedResult } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root',
})
export class InventoryServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.productServiceBaseUrl}/Inventory`;
  private http = inject(HttpClient);

  getByProduct(productId: string, size?: string, color?: string, includeRetired = false): Promise<InventoryItemDto[]> {
    let params = new HttpParams();
    if (size) params = params.append('size', size);
    if (color) params = params.append('color', color);
    params = params.append('includeRetired', includeRetired.toString());

    return lastValueFrom(this.http.get<InventoryItemDto[]>(`${this.baseUrl}/product/${productId}`, { params }));
  }

  getAvailable(productId: string, size?: string, color?: string): Promise<InventoryItemDto[]> {
    let params = new HttpParams();
    if (size) params = params.append('size', size);
    if (color) params = params.append('color', color);

    return lastValueFrom(this.http.get<InventoryItemDto[]>(`${this.baseUrl}/product/${productId}/available`, { params }));
  }

  getById(inventoryItemId: string): Promise<InventoryItemDto> {
    return lastValueFrom(this.http.get<InventoryItemDto>(`${this.baseUrl}/${inventoryItemId}`));
  }

  add(command: AddInventoryItemCommand): Promise<string> {
    return lastValueFrom(this.http.post<string>(this.baseUrl, command));
  }

  update(inventoryItemId: string, command: UpdateInventoryItemCommand): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.baseUrl}/${inventoryItemId}`, command));
  }

  updateStatus(inventoryItemId: string, command: UpdateInventoryStatusCommand): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.baseUrl}/${inventoryItemId}/status`, command));
  }

  search(command: SearchInventoryQuery): Promise<PaginatedResult<InventoryItemDto>> {
    return lastValueFrom(this.http.post<PaginatedResult<InventoryItemDto>>(`${this.baseUrl}/search`, command));
  }

  generateCodes(inventoryItemId: string): Promise<void> {
    return lastValueFrom(this.http.post<void>(`${this.baseUrl}/${inventoryItemId}/generate-codes`, {}));
  }
}