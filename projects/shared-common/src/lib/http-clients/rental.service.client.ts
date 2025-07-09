import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  CreateRentalCommand,
  RentalDto,
  PaginatedResult,
  UpdateRentalCommand
} from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class RentalServiceClient {
  private readonly config = inject(APP_CONFIG) as AppConfig;
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${this.config.rentalServiceBaseUrl}/Rental`;

  getRentals(query?: {
    customerId?: string;
    productId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    descending?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<RentalDto>> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return lastValueFrom(
      this.http.get<PaginatedResult<RentalDto>>(`${this.baseUrl}?${params.toString()}`)
    );
  }

  getRental(id: string): Promise<RentalDto> {
    return lastValueFrom(this.http.get<RentalDto>(`${this.baseUrl}/${id}`));
  }

  createRental(payload: CreateRentalCommand): Promise<string> {
    return lastValueFrom(this.http.post<string>(this.baseUrl, payload));
  }

  updateRental(id: string, payload: UpdateRentalCommand): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.baseUrl}/${id}`, payload));
  }

  deleteRental(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}