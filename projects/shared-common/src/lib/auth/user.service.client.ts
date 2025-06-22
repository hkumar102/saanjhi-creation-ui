import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../core/app-config.token';
import { lastValueFrom } from 'rxjs';
import { UserModel } from '..//models/user.model';

@Injectable({ providedIn: 'root' })
export class UserServiceClient {


    constructor(
        private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig
    ) { }

    get url(): string {
        return this.config.userServiceBaseUrl;
    }

    createUser(data: UserModel) {
        const url = this.url;
        return lastValueFrom(this.http.post(url, data));
    }

    /**
    * Gets a user from the backend by Firebase UID.
    * Throws if the user is not found.
    * @param firebaseUid The Firebase UID to lookup
    */
    async getUserByFirebaseUid(firebaseUid: string): Promise<UserModel | null> {
        const url = this.url;
        try {
            return await lastValueFrom(this.http
                .get<UserModel>(`${this.url}/${firebaseUid}`));
        } catch (error: any) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                return null
            }
            throw error;
        }
    }
}
