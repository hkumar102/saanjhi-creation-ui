import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    AddressDto,
    CreateAddressCommand,
    CreateCustomerCommand,
    CustomerDto,
    UpdateAddressCommand,
    UpdateCustomerCommand,
    PaginatedResult,
    GetCustomersByIdsQuery,
    GetAddressesByIdsQuery,
    GetCustomersQuery
} from '../models';
import { lastValueFrom } from 'rxjs';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class CustomerServiceClient {
    private config = inject(APP_CONFIG) as AppConfig;
    private baseUrl = `${this.config.productServiceBaseUrl}`;
    private http = inject(HttpClient);

    /**
     * Get customers with pagination (POST method)
     */
    getCustomers(query?: GetCustomersQuery): Promise<PaginatedResult<CustomerDto>> {
        // Use POST method to send query object in request body
        const payload = query || {};
        return lastValueFrom(
            this.http.post<PaginatedResult<CustomerDto>>(`${this.baseUrl}/Customer/Search`, payload)
        );
    }

    /**
     * Get customer by ID
     */
    getCustomer(id: string): Promise<CustomerDto> {
        return lastValueFrom(
            this.http.get<CustomerDto>(`${this.baseUrl}/Customer/${id}`)
        );
    }

    /**
     * Get customers by multiple IDs
     */
    getCustomersByIds(query: GetCustomersByIdsQuery): Promise<CustomerDto[]> {
        return lastValueFrom(
            this.http.post<CustomerDto[]>(`${this.baseUrl}/Customer/by-ids`, query)
        );
    }

    /**
     * Create a new customer
     */
    createCustomer(payload: CreateCustomerCommand): Promise<string> {
        return lastValueFrom(
            this.http.post<string>(`${this.baseUrl}/Customer`, payload)
        );
    }

    /**
     * Update an existing customer
     */
    updateCustomer(payload: UpdateCustomerCommand): Promise<void> {
        return lastValueFrom(
            this.http.put<void>(`${this.baseUrl}/Customer`, payload)
        );
    }

    /**
     * Delete a customer
     */
    deleteCustomer(id: string): Promise<void> {
        return lastValueFrom(
            this.http.delete<void>(`${this.baseUrl}/Customer/${id}`)
        );
    }

    /**
     * Get addresses for a customer
     */
    getCustomerAddresses(customerId: string): Promise<AddressDto[]> {
        return lastValueFrom(
            this.http.get<AddressDto[]>(`${this.baseUrl}/Customer/${customerId}/Addresses?customerId=${customerId}`)
        );
    }

    /**
     * Get address by ID
     */
    getAddress(id: string): Promise<AddressDto> {
        return lastValueFrom(
            this.http.get<AddressDto>(`${this.baseUrl}/CustomerAddress/${id}`)
        );
    }

    /**
     * Get addresses by multiple IDs
     */
    getAddressesByIds(query: GetAddressesByIdsQuery): Promise<AddressDto[]> {
        return lastValueFrom(
            this.http.post<AddressDto[]>(`${this.baseUrl}/CustomerAddress/by-ids`, query)
        );
    }

    /**
     * Create a new address
     */
    createAddress(payload: CreateAddressCommand): Promise<string> {
        return lastValueFrom(
            this.http.post<string>(`${this.baseUrl}/CustomerAddress/address`, payload)
        );
    }

    /**
     * Update an existing address
     */
    updateAddress(id: string, payload: UpdateAddressCommand): Promise<void> {
        return lastValueFrom(
            this.http.put<void>(`${this.baseUrl}/CustomerAddress/${id}`, payload)
        );
    }

    /**
     * Delete an address
     */
    deleteAddress(id: string): Promise<void> {
        return lastValueFrom(
            this.http.delete<void>(`${this.baseUrl}/CustomerAddress/${id}`)
        );
    }
}