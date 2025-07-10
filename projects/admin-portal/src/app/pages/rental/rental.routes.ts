import { Routes } from "@angular/router";

export const RENTAL_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./rental-list/rental-list.component').then(m => m.RentalListComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./rental-form/rental-form.component').then(m => m.RentalFormComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./rental-form/rental-form.component').then(m => m.RentalFormComponent)
    }
];