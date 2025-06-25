import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ProductDto, CreateProductCommand, UpdateProductCommand, PaginatedResult, ProductFilter } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root',
})
export class ProductServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.productServiceBaseUrl}`;
  private http = inject(HttpClient);

  getAll(query?: ProductFilter): Promise<PaginatedResult<ProductDto>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return lastValueFrom(this.http.get<PaginatedResult<ProductDto>>(this.baseUrl, { params }));
  }

  getById(id: string): Promise<ProductDto> {
    return lastValueFrom(this.http.get<ProductDto>(`${this.baseUrl}/${id}`));
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
}
