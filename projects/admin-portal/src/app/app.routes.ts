import { Routes } from '@angular/router';
import { AuthGuard } from '@saanjhi-creation-ui/shared-common';
import { CUSTOMER_ROUTES } from './pages/customer/customer.routes';
import { USER_ROUTES } from './pages/user/user.routes';
import { RENTAL_ROUTES } from './pages/rental/rental.routes';
import { PRODUCT_ROUTES } from './pages/product/product.routes';
export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'identity',
        canActivate: [AuthGuard],
        loadChildren: () => [
            {
                path: 'update-user',
                loadComponent: () =>
                    import('./pages/identity/update-profile/update-profile.component').then(m => m.UpdateProfileComponent),

            }]
    },
    {
        path: 'customers',
        children: CUSTOMER_ROUTES,
        canActivate: [AuthGuard]
    },
    {
        path: 'users',
        children: USER_ROUTES,
        canActivate: [AuthGuard]
    },
    {
        path: 'rentals',
        children: RENTAL_ROUTES,
        canActivate: [AuthGuard]
    },
    {
        path: 'products',
        children: PRODUCT_ROUTES,
        canActivate: [AuthGuard]
    },
    {
        path: 'reports',
        loadComponent: () => import('./pages/rental/rental-reports/rental-reports.component').then(m => m.RentalReportsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/products'
    }
];
