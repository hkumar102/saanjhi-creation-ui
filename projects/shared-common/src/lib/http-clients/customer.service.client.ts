import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    AddressDto,
    CreateAddressCommand,
    CreateCustomerCommand,
    CustomerDto,
    UpdateAddressCommand,
    UpdateCustomerCommand
} from '../models';
import { lastValueFrom } from 'rxjs';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class CustomerServiceClient {
    private config = inject(APP_CONFIG) as AppConfig;
    private baseUrl = `${this.config.customerServiceBaseUrl}`;
    private http = inject(HttpClient);

    getCustomers(query?: {
        name?: string;
        email?: string;
        phoneNumber?: string;
        sortBy?: string;
        sortDesc?: boolean;
        page?: number;
        pageSize?: number;
    }): Promise<CustomerDto[]> {
        const params = new URLSearchParams();
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        return lastValueFrom(
            this.http.get<CustomerDto[]>(`${this.baseUrl}/Customer?${params.toString()}`)
        );
    }

    getCustomer(id: string): Promise<CustomerDto> {
        return lastValueFrom(
            this.http.get<CustomerDto>(`${this.baseUrl}/Customer/${id}`)
        );
    }

    createCustomer(payload: CreateCustomerCommand): Promise<string> {
        return lastValueFrom(
            this.http.post<string>(`${this.baseUrl}/Customer`, payload)
        );
    }

    updateCustomer(payload: UpdateCustomerCommand): Promise<void> {
        return lastValueFrom(
            this.http.put<void>(`${this.baseUrl}/Customer`, payload)
        );
    }

    deleteCustomer(id: string): Promise<void> {
        return lastValueFrom(
            this.http.delete<void>(`${this.baseUrl}/Customer/${id}`)
        );
    }

    getCustomerAddresses(customerId: string): Promise<AddressDto[]> {
        return lastValueFrom(
            this.http.get<AddressDto[]>(`${this.baseUrl}/Customer/${customerId}/Addresses`)
        );
    }

    getAddress(id: string): Promise<AddressDto> {
        return lastValueFrom(
            this.http.get<AddressDto>(`${this.baseUrl}/CustomerAddress/${id}`)
        );
    }

    createAddress(payload: CreateAddressCommand): Promise<string> {
        return lastValueFrom(
            this.http.post<string>(`${this.baseUrl}/CustomerAddress/address`, payload)
        );
    }

    updateAddress(id: string, payload: UpdateAddressCommand): Promise<void> {
        return lastValueFrom(
            this.http.put<void>(`${this.baseUrl}/CustomerAddress/${id}`, payload)
        );
    }

    deleteAddress(id: string): Promise<void> {
        return lastValueFrom(
            this.http.delete<void>(`${this.baseUrl}/CustomerAddress/${id}`)
        );
    }
}