import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ProductDto, ProductFormModel } from '../models/product.model';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../core/app-config.token'; // Config token for base URL

/**
 * Service to manage product-related API calls for the admin portal.
 */
@Injectable({ providedIn: 'root' })
export class ProductServiceClient {
  private http = inject(HttpClient);
  private config = inject<AppConfig>(APP_CONFIG);

  /**
   * The base URL for all product-related endpoints.
   */
  private baseUrl = `${this.config.productServiceBaseUrl}`;

  /**
   * Retrieves all products with optional filtering and pagination.
   */
  getAll(params: {
    name?: string;
    categoryId?: string;
    page?: number;
    pageSize?: number;
  }): Observable<ProductDto[]> {
    let httpParams = new HttpParams();
    if (params.name) httpParams = httpParams.set('name', params.name);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<ProductDto[]>(this.baseUrl, { params: httpParams });
  }

  /**
   * Retrieves a product by its unique ID.
   */
  getById(productId: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/${productId}`);
  }

  /**
   * Creates a new product with images using FormData.
   */
  create(formModel: ProductFormModel): Observable<ProductDto> {
    const formData = this.buildFormData(formModel);
    return this.http.post<ProductDto>(this.baseUrl, formData);
  }

  /**
   * Updates an existing product using FormData.
   */
  update(productId: string, formModel: ProductFormModel): Observable<ProductDto> {
    const formData = this.buildFormData(formModel);
    return this.http.put<ProductDto>(`${this.baseUrl}/${productId}`, formData);
  }

  /**
   * Deletes a product by its ID.
   */
  delete(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }

  /**
   * Patches specific fields on a product using JSON Patch operations.
   */
  patch(productId: string, patchOps: any[]): Observable<ProductDto> {
    return this.http.patch<ProductDto>(
      `${this.baseUrl}/${productId}`,
      patchOps,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' }) }
    );
  }

  /**
   * Deletes an image from a product by product ID and image ID.
   */
  deleteImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  /**
   * Converts a ProductFormModel to FormData for file upload support.
   */
  private buildFormData(model: ProductFormModel): FormData {
    const formData = new FormData();
    formData.append('Name', model.name);
    formData.append('Price', model.price.toString());
    formData.append('RentalPrice', model.rentalPrice.toString());
    formData.append('InStock', model.inStock.toString());
    formData.append('IsRental', model.isRental.toString());
    formData.append('CategoryId', model.categoryId);
    model.images.forEach(file => formData.append('Images', file));
    return formData;
  }
}
