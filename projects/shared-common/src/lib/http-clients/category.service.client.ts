import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CategoryDto, CreateCategoryCommand, UpdateCategoryCommand } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class CategoryServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.categoryServiceBaseUrl}/category`;
  private http = inject(HttpClient);

  async getAll(): Promise<CategoryDto[]> {
    return await lastValueFrom(this.http.get<CategoryDto[]>(this.baseUrl));
  }

  async getById(id: string): Promise<CategoryDto> {
    return await lastValueFrom(this.http.get<CategoryDto>(`${this.baseUrl}/${id}`));
  }

  async create(command: CreateCategoryCommand): Promise<string> {
    return await lastValueFrom(this.http.post<string>(this.baseUrl, command));
  }

  async update(id: string, command: UpdateCategoryCommand): Promise<void> {
    return await lastValueFrom(this.http.put<void>(`${this.baseUrl}/${id}`, command));
  }

  async delete(id: string): Promise<void> {
    return await lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  async getByIds(ids: string[]): Promise<CategoryDto[]> {
    return await lastValueFrom(this.http.post<CategoryDto[]>(`${this.baseUrl}/by-ids`, ids));
  }
}