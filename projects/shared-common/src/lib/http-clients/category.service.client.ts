import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CategoryDto } from '../models';
import { APP_CONFIG, AppConfig } from '../core/app-config.token';

@Injectable({
    providedIn: 'root',
})
export class CategoryServiceClient {
    private config = inject(APP_CONFIG) as AppConfig;
    private baseUrl = `${this.config.categoryServiceBaseUrl}`;
    private http = inject(HttpClient);

    getAll(): Promise<CategoryDto[]> {
        return lastValueFrom(this.http.get<CategoryDto[]>(`${this.baseUrl}`));
    }

    getById(id: string): Promise<CategoryDto> {
        return lastValueFrom(this.http.get<CategoryDto>(`${this.baseUrl}/${id}`));
    }

    create(dto: CategoryDto): Promise<void> {
        return lastValueFrom(this.http.post<void>(`${this.baseUrl}`, dto));
    }

    update(dto: CategoryDto): Promise<void> {
        return lastValueFrom(this.http.put<void>(`${this.baseUrl}`, dto));
    }

    delete(id: string): Promise<void> {
        return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
    }
}
