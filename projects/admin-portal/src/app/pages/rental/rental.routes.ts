import { Routes } from "@angular/router";

export const RENTAL_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./rental-list/rental-list.component').then(m => m.RentalListComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./create-rental/create-rental.component').then(m => m.CreateRentalComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./rental-form/rental-form.component').then(m => m.RentalFormComponent)
    },
    {
        path: 'manage/:id',
        loadComponent: () => import('./rental-management/rental-management.component').then(m => m.RentalManagementComponent)
    }
];