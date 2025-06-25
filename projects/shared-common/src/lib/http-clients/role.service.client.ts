// shared/services/role.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable, of } from 'rxjs';
import { Role } from '../models';
import { APP_CONFIG, AppConfig } from '@saanjhi-creation-ui/shared-common';

@Injectable({
    providedIn: 'root'
})
export class RoleServiceClient {
    private config = inject(APP_CONFIG) as AppConfig;
    private baseUrl = `${this.config.userServiceBaseUrl}`;
    private http = inject(HttpClient);

    getAllRoles(): Promise<Role[]> {
        return lastValueFrom(of([
            { id: 'edcc3cff-ab71-44e7-99b7-1a8917117598', name: 'Admin' },
            { id: 'b983a03d-e1e5-4ef6-9cc1-c2f405fa6c46', name: 'Customer' },
        ]));
    }
}
