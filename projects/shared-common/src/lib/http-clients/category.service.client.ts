import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { 
  CategoryDto, 
  CreateCategoryCommand, 
  UpdateCategoryCommand, 
  GetAllCategoriesQuery,
  PaginatedResult 
} from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class CategoryServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.categoryServiceBaseUrl}`;
  private http = inject(HttpClient);

  /**
   * Get all categories with pagination (GET method with query params)
   */
  async getAll(query?: GetAllCategoriesQuery): Promise<PaginatedResult<CategoryDto>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.search) params = params.set('search', query.search);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortDesc !== undefined) params = params.set('sortDesc', query.sortDesc.toString());
      if (query.page) params = params.set('page', query.page.toString());
      if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
    }

    return await lastValueFrom(
      this.http.get<PaginatedResult<CategoryDto>>(`${this.baseUrl}/Category`, { params })
    );
  }

  /**
   * Search categories with pagination (POST method with request body)
   */
  async search(query?: GetAllCategoriesQuery): Promise<PaginatedResult<CategoryDto>> {
    const payload = query || {};
    return await lastValueFrom(
      this.http.post<PaginatedResult<CategoryDto>>(`${this.baseUrl}/Category/search`, payload)
    );
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<CategoryDto> {
    return await lastValueFrom(
      this.http.get<CategoryDto>(`${this.baseUrl}/Category/${id}`)
    );
  }

  /**
   * Create a new category
   */
  async create(command: CreateCategoryCommand): Promise<string> {
    return await lastValueFrom(
      this.http.post<string>(`${this.baseUrl}/Category`, command)
    );
  }

  /**
   * Update an existing category
   */
  async update(id: string, command: UpdateCategoryCommand): Promise<void> {
    return await lastValueFrom(
      this.http.put<void>(`${this.baseUrl}/Category/${id}`, command)
    );
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    return await lastValueFrom(
      this.http.delete<void>(`${this.baseUrl}/Category/${id}`)
    );
  }

  /**
   * Get categories by multiple IDs
   */
  async getByIds(ids: string[]): Promise<CategoryDto[]> {
    return await lastValueFrom(
      this.http.post<CategoryDto[]>(`${this.baseUrl}/Category/by-ids`, ids)
    );
  }

  /**
   * Get all categories without pagination (for dropdowns)
   * @deprecated Use getAll() or search() instead
   */
  async getAllSimple(): Promise<CategoryDto[]> {
    const result = await this.getAll({ page: 1, pageSize: 1000 });
    return result.items || [];
  }
}