import { Routes } from '@angular/router';
import { AuthGuard } from '@saanjhi-creation-ui/shared-common';
import { LayoutComponent } from '@saanjhi-creation-ui/shared-ui';
export const routes: Routes = [{
    path: '',
    component: LayoutComponent,
    children: [
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
            loadChildren: () => import('./pages/product/product.routes').then(m => m.productRoutes)
        },
        {
            path: '',
            redirectTo: 'login',
            pathMatch: 'full'
        }
    ]
}];
