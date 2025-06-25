import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserContextService, UserServiceClient } from '@saanjhi-creation-ui/shared-common';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private auth = inject(Auth);
    private userServiceClient = inject(UserServiceClient);
    private userContextService = inject(UserContextService);


    constructor(private router: Router) {

        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.userServiceClient.getUserByFirebaseId(user.uid)
                    .then((userModel) => {
                        this.userContextService.setUser(userModel);
                        this.goToProducts();
                    });
            }
        });
    }

    goToProfile() {
        this.router.navigate(['/identity/profile']);
    }

    gotoUpdateProfile() {
        this.router.navigate(['/identity/update-user']);
    }

    goToLogin(redirectTo?: string) {
        this.router.navigate(['/login'], {
            queryParams: redirectTo ? { redirectTo } : {}
        });
    }

    goTo(path: string | any[]) {
        this.router.navigate(typeof path === 'string' ? [path] : path);
    }

    goToHome() {
        this.router.navigate(['/']);
    }

    goToProducts() {
        this.router.navigate(['/products']);
    }
    goToProductCreate() {
        this.router.navigate(['/products/create']);
    }
    goToProductEdit(id: string) {
        this.router.navigate(['/products/edit', id]);
    }
    goToProductDetails(id: string) {
        this.router.navigate(['/products/details', id]);
    }
    goToCategories() {
        this.router.navigate(['/categories']);
    }
}
