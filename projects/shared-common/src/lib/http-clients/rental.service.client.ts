import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  CreateRentalCommand,
  RentalDto,
  PaginatedResult,
  UpdateRentalCommand,
  GetRentalsQuery,
  UpdateRentalStatusCommand
} from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class RentalServiceClient {
  private readonly config = inject(APP_CONFIG) as AppConfig;
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${this.config.rentalServiceBaseUrl}`;

  /**
   * Get rentals with search filters (POST method)
   */
  getRentals(query?: GetRentalsQuery): Promise<PaginatedResult<RentalDto>> {
    // Use POST method to send query object in request body
    const payload = query || {};
    return lastValueFrom(
      this.http.post<PaginatedResult<RentalDto>>(`${this.baseUrl}/rental/search`, payload)
    );
  }

  getRental(id: string): Promise<RentalDto> {
    return lastValueFrom(this.http.get<RentalDto>(`${this.baseUrl}/rental/${id}`));
  }

  createRental(payload: CreateRentalCommand): Promise<string> {
    return lastValueFrom(this.http.post<string>(`${this.baseUrl}/rental`, payload));
  }

  updateRental(id: string, payload: UpdateRentalCommand): Promise<void> {
    return lastValueFrom(this.http.put<void>(`${this.baseUrl}/rental/${id}`, payload));
  }

  deleteRental(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/rental/${id}`));
  }

  updateRentalStatus(id: string, payload: UpdateRentalStatusCommand): Promise<void> {
    return lastValueFrom(
      this.http.put<void>(`${this.baseUrl}/rental/${id}/status`, payload)
    );
  }
}