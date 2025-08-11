// shared/services/media.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, Observable, of } from 'rxjs';
import { ProductMediaDto, AddProductMediaCommand, UploadMediaResult } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
  providedIn: 'root',
})
export class MediaServiceClient {
  private config = inject(APP_CONFIG) as AppConfig;
  private baseUrl = `${this.config.mediaServiceBaseUrl}/Media`;
  private http = inject(HttpClient);

  getProductMedia(productId: string, color?: string): Promise<ProductMediaDto[]> {
    let params = new HttpParams();
    if (color) params = params.append('color', color);

    return lastValueFrom(this.http.get<ProductMediaDto[]>(`${this.baseUrl}/product/${productId}`, { params }));
  }

  getProductMediaByColor(productId: string): Promise<Record<string, ProductMediaDto[]>> {
    return lastValueFrom(this.http.get<Record<string, ProductMediaDto[]>>(`${this.baseUrl}/product/${productId}/by-color`));
  }

  getMainImage(productId: string, color?: string): Promise<ProductMediaDto> {
    let params = new HttpParams();
    if (color) params = params.append('color', color);

    return lastValueFrom(this.http.get<ProductMediaDto>(`${this.baseUrl}/product/${productId}/main`, { params }));
  }

  getGallery(productId: string, color?: string): Promise<ProductMediaDto[]> {
    let params = new HttpParams();
    if (color) params = params.append('color', color);

    return lastValueFrom(this.http.get<ProductMediaDto[]>(`${this.baseUrl}/product/${productId}/gallery`, { params }));
  }

  add(command: AddProductMediaCommand): Promise<string> {
    return lastValueFrom(this.http.post<string>(this.baseUrl, command));
  }

  delete(mediaId: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${mediaId}`));
  }

  upload(folderName: string = 'Misc', file: File): Promise<UploadMediaResult> {
    if (!file || !(file instanceof File)) {
      return Promise.reject(new Error('Invalid file provided for upload'));
    }

    const formData = new FormData();
    formData.append('file', file);

    return lastValueFrom(this.http.post<UploadMediaResult>(`${this.baseUrl}/upload?folderName=${folderName}`, formData));
  }
}
