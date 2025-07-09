import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    CreateUserCommand,
    UpdateUserCommand,
    UserDto,
    UserDtoPaginatedResult,
    UserRoleDto,
    UpdateUserProfileCommand
} from '../models';
import { lastValueFrom } from 'rxjs';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({ providedIn: 'root' })
export class UserServiceClient {
    private config = inject(APP_CONFIG) as AppConfig;
    private http = inject(HttpClient);
    private baseUrl = `${this.config.userServiceBaseUrl}/User`;

    createUser(command: CreateUserCommand): Promise<UserDto> {
        return lastValueFrom(this.http.post<UserDto>(`${this.baseUrl}`, command));
    }

    updateUser(command: UpdateUserCommand): Promise<UserDto> {
        return lastValueFrom(this.http.put<UserDto>(`${this.baseUrl}`, command));
    }

    getUser(userId: string): Promise<UserDto> {
        return lastValueFrom(this.http.get<UserDto>(`${this.baseUrl}/${userId}`));
    }

    getUserByFirebaseUid(firebaseUserId: string): Promise<UserDto> {
        return lastValueFrom(this.http.get<UserDto>(`${this.baseUrl}/firebase/${firebaseUserId}`));
    }

    getUserRoles(userId: string): Promise<UserRoleDto[]> {
        return lastValueFrom(this.http.get<UserRoleDto[]>(`${this.baseUrl}/${userId}/roles`));
    }

    updateUserRoles(userId: string, roles: UserRoleDto[]): Promise<UserRoleDto[]> {
        return lastValueFrom(this.http.put<UserRoleDto[]>(`${this.baseUrl}/${userId}/Roles`, roles));
    }

    deactivateUser(userId: string): Promise<void> {
        return lastValueFrom(this.http.post<void>(`${this.baseUrl}/${userId}/deactivate`, {}));
    }

    activateUser(userId: string): Promise<void> {
        return lastValueFrom(this.http.post<void>(`${this.baseUrl}/${userId}/activate`, {}));
    }

    searchUsers(query: {
        Name?: string;
        Email?: string;
        Phone?: string;
        Page?: number;
        PageSize?: number;
    }): Promise<UserDtoPaginatedResult> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
        return lastValueFrom(
            this.http.get<UserDtoPaginatedResult>(`${this.baseUrl}/search?${params.toString()}`)
        );
    }

    updateUserProfile(command: UpdateUserProfileCommand): Promise<void> {
        return lastValueFrom(this.http.put<void>(`${this.baseUrl}/profile`, command));
    }
}