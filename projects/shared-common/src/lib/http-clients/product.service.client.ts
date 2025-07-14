import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ProductDto, CreateProductCommand, UpdateProductCommand, GetAllProductsQuery, GetProductsByIdsQuery, ProductDtoPaginatedResult, ProductMediaDto } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root',
})
export class ProductServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.productServiceBaseUrl}/Product`;
  private http = inject(HttpClient);

  search(query: GetAllProductsQuery): Promise<ProductDtoPaginatedResult> {
    return lastValueFrom(this.http.post<ProductDtoPaginatedResult>(`${this.baseUrl}/search`, query));
  }

  getById(id: string): Promise<ProductDto> {
    return lastValueFrom(this.http.get<ProductDto>(`${this.baseUrl}/${id}`));
  }

  getByIds(query: GetProductsByIdsQuery): Promise<ProductDto[]> {
    return lastValueFrom(this.http.post<ProductDto[]>(`${this.baseUrl}/by-ids`, query));
  }

  create(product: CreateProductCommand): Promise<string> {
    return lastValueFrom(this.http.post<string>(this.baseUrl, product));
  }

  update(id: string, product: UpdateProductCommand): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.baseUrl}/${id}`, product));
  }

  delete(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  uploadMedia(productId: string, file: File, isPrimary: boolean = false, color?: string, altText?: string, displayOrder: number = 0): Promise<ProductMediaDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary.toString());
    if (color) formData.append('color', color);
    if (altText) formData.append('altText', altText);
    formData.append('displayOrder', displayOrder.toString());

    return lastValueFrom(this.http.post<ProductMediaDto>(`${this.baseUrl}/${productId}/media`, formData));
  }
}
