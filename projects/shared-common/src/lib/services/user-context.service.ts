import { Injectable, computed, signal } from '@angular/core';
import { UserDto as UserModel } from '../models';

/**
 * Provides current Firebase user context throughout the app.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {

    private userSignal = signal<UserModel | null>(null);
    private accessTokenSignal = signal<string | undefined>(undefined);
    constructor() {
    }

    readonly user = computed(() => this.userSignal());
    readonly isAuthenticated = computed(() => this.userSignal() !== null);
    readonly accessToken = computed(() => this.accessTokenSignal());

    get firebaseUserId(): string {
        return this.user()?.firebaseUserId!;
    }

    get userId(): string {
        return this.user()?.id!;
    }

    get email(): string | null {
        return this.user()?.email ?? null;
    }

    get displayName(): string | null {
        return this.user()?.displayName ?? null;
    }

    setUser(user: UserModel | null) {
        this.userSignal.set(user);
        if (!user) {
            this.setAccessToken(undefined);
        }
    }

    setAccessToken(token: string | undefined) {
        this.accessTokenSignal.set(token);
    }
}
