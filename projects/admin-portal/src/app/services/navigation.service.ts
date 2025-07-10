import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserContextService, UserServiceClient } from '@saanjhi-creation-ui/shared-common';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {


    constructor(private router: Router) {
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
    goToCategoryCreate() {
        this.router.navigate(['/categories/create']);
    }
    goToCategoryEdit(id: string) {
        this.router.navigate(['/categories/edit', id]);
    }
    goToCustomers() {
        this.router.navigate(['/customers']);
    }
    goToCustomerCreate() {
        this.router.navigate(['/customers/create']);
    }
    goToCustomerEdit(id: string) {
        this.router.navigate(['/customers/edit', id]);
    }

    goToUsers() {
        this.router.navigate(['/users']);
    }
    goToUserCreate() {
        this.router.navigate(['/users/create']);
    }
    goToUserEdit(id: string) {
        this.router.navigate(['/users/edit', id]);
    }

    goToRentals() {
        this.router.navigate(['/rentals']);
    }
    goToRentalCreate() {
        this.router.navigate(['/rentals/create']);
    }
    goToRentalEdit(id: string) {
        this.router.navigate(['/rentals/edit', id]);
    }
}
