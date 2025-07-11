import { Routes } from '@angular/router';
import { AuthGuard } from '@saanjhi-creation-ui/shared-common';
import { CATEGORY_ROUTES } from './pages/category/category.routes';
import { CUSTOMER_ROUTES } from './pages/customer/customer.routes';
import { USER_ROUTES } from './pages/user/user.routes';
import { RENTAL_ROUTES } from './pages/rental/rental.routes';
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
        path: 'products',
        loadChildren: () => import('./pages/product/product.routes').then(m => m.productRoutes),
        canActivate: [AuthGuard]
    },
    {
        path: 'categories',
        children: CATEGORY_ROUTES,
        canActivate: [AuthGuard]
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
        path: 'reports',
        loadComponent: () => import('./pages/rental/rental-reports/rental-reports.component').then(m => m.RentalReportsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/dashboard'
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then(r => r.dashboardRoutes),
        canActivate: [AuthGuard]
    },
    {
        path: 'inventory',
        loadChildren: () => import('./pages/inventory/inventory.routes').then(r => r.inventoryRoutes),
        canActivate: [AuthGuard]
    }
];
