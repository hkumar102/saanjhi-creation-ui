import { inject, Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { APP_CONFIG, AppConfig, UserModel } from '@saanjhi-creation-ui/shared-common';
import { ShippingAddressDto } from '../models/address.model';
import { PaginatedResult, PaginationQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class UserServiceClient {

    private config = inject(APP_CONFIG) as AppConfig;
    private baseUrl = `${this.config.userServiceBaseUrl}`;
    private http = inject(HttpClient);

    async createUser(user: UserModel): Promise<void> {
        await lastValueFrom(this.http.post<void>(`${this.baseUrl}`, user));
    }

    async updateUser(user: UserModel): Promise<void> {
        await lastValueFrom(this.http.put<void>(`${this.baseUrl}`, user));
    }

    async addShippingAddress(address: ShippingAddressDto): Promise<void> {
        await lastValueFrom(this.http.post<void>(`${this.baseUrl}/address`, address));
    }

    async deactivateUser(userId: string): Promise<void> {
        await lastValueFrom(this.http.post<void>(`${this.baseUrl}/${userId}/deactivate`, {}));
    }

    async activateUser(userId: string): Promise<void> {
        await lastValueFrom(this.http.post<void>(`${this.baseUrl}/${userId}/activate`, {}));
    }

    async getUserByFirebaseId(firebaseUserId: string): Promise<UserModel> {
        return await lastValueFrom(this.http.get<UserModel>(`${this.baseUrl}/firebase/${firebaseUserId}`));
    }

    async getUserById(userId: string): Promise<UserModel> {
        return await lastValueFrom(this.http.get<UserModel>(`${this.baseUrl}/${userId}`));
    }

    async getUserRoles(userId: string): Promise<string[]> {
        return await lastValueFrom(this.http.get<string[]>(`${this.baseUrl}/${userId}/roles`));
    }

    async searchUsers(query: PaginationQuery): Promise<PaginatedResult<UserModel>> {
        const params = new HttpParams()
            .set('name', query.name || '')
            .set('email', query.email || '')
            .set('phone', query.phone || '')
            .set('page', query.page.toString())
            .set('pageSize', query.pageSize.toString());

        return await lastValueFrom(this.http.get<PaginatedResult<UserModel>>(`${this.baseUrl}/search`, { params }));
    }

    async updateUserRoles(userId: string, roles: UserModel[]): Promise<void> {
        await lastValueFrom(this.http.put<void>(`${this.baseUrl}/${userId}/roles`, roles));
    }

    /**
    * Gets a user from the backend by Firebase UID.
    * Throws if the user is not found.
    * @param firebaseUid The Firebase UID to lookup
    */
    async getUserByFirebaseUid(firebaseUid: string): Promise<UserModel | null> {
        try {
            return await lastValueFrom(this.http
                .get<UserModel>(`${this.baseUrl}/firebase/${firebaseUid}`));
        } catch (error: any) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                return null
            }
            throw error;
        }
    }

    async updateProfile(user: UserModel): Promise<void> {
        await lastValueFrom(this.http.put<void>(`${this.baseUrl}/profile`, user));
    }
}
