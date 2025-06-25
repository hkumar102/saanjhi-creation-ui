// shared/services/media.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable, of } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../core/app-config.token';
import { MediaType, MediaTypeDto, UploadMediaResult } from '../models';

@Injectable({
    providedIn: 'root'
})
export class MediaServiceClient {
    private config = inject(APP_CONFIG) as AppConfig;
    private baseUrl = `${this.config.mediaServiceBaseUrl}`;
    private http = inject(HttpClient);


    upload(file: File, mediaType: MediaType): Promise<UploadMediaResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mediaType', mediaType.toString());

        return lastValueFrom(this.http.post<UploadMediaResult>(`${this.baseUrl}/upload`, formData));
    }

    getMediaTypes(): Promise<MediaTypeDto[]> {
        return lastValueFrom(of([{ label: 'Image', id: MediaType.Image }]));
    }
}
