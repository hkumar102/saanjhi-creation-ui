import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CategoryDto, CreateCategoryCommand, UpdateCategoryCommand, GetAllCategoriesQuery, PaginatedResult } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root',
})
export class CategoryServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.productServiceBaseUrl}/Category`;
  private http = inject(HttpClient);

  /**
   * Get all categories (returns paginated result)
   */
  getAll(query?: GetAllCategoriesQuery): Promise<PaginatedResult<CategoryDto>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.search) params = params.set('search', query.search);
      if (query.searchName) params = params.set('searchName', query.searchName);
      if (query.searchDescription) params = params.set('searchDescription', query.searchDescription);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortDesc !== undefined) params = params.set('sortDesc', query.sortDesc.toString());
      if (query.page !== undefined) params = params.set('page', query.page.toString());
      if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize.toString());
    }
    
    return lastValueFrom(this.http.get<PaginatedResult<CategoryDto>>(this.baseUrl, { params }));
  }

  /**
   * Get all categories as a simple array (for backward compatibility)
   */
  getAllSimple(query?: GetAllCategoriesQuery): Promise<CategoryDto[]> {
    return this.getAll(query).then(result => result.items || []);
  }

  /**
   * Get category by ID
   */
  getById(id: string): Promise<CategoryDto> {
    return lastValueFrom(this.http.get<CategoryDto>(`${this.baseUrl}/${id}`));
  }

  /**
   * Get categories by multiple IDs
   */
  getByIds(categoryIds: string[]): Promise<CategoryDto[]> {
    return lastValueFrom(this.http.post<CategoryDto[]>(`${this.baseUrl}/by-ids`, categoryIds));
  }

  /**
   * Create a new category
   */
  create(category: CreateCategoryCommand): Promise<string> {
    return lastValueFrom(this.http.post<string>(this.baseUrl, category));
  }

  /**
   * Update an existing category
   */
  update(id: string, category: UpdateCategoryCommand): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.baseUrl}/${id}`, category));
  }

  /**
   * Delete a category
   */
  delete(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  /**
   * Get deleted categories
   */
  getDeleted(): Promise<CategoryDto[]> {
    return lastValueFrom(this.http.get<CategoryDto[]>(`${this.baseUrl}/deleted`));
  }

  /**
   * Restore a deleted category
   */
  restore(id: string): Promise<void> {
    return lastValueFrom(this.http.post<void>(`${this.baseUrl}/${id}/restore`, null));
  }
}