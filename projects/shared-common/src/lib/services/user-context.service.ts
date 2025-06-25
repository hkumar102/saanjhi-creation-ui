import { Injectable, computed, signal } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { UserModel } from '../models';
import { UserServiceClient } from '@saanjhi-creation-ui/shared-common';

/**
 * Provides current Firebase user context throughout the app.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
    private auth = inject(Auth);
    private userSignal = signal<UserModel | null>(null);
    private userServiceClient = inject(UserServiceClient);

    constructor() {
    }

    readonly user = computed(() => this.userSignal());

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

    isAuthenticated(): boolean {
        return !!this.firebaseUserId;
    }

    setUser(user: UserModel | null) {
        this.userSignal.set(user);
    }
}
