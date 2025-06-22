import { Routes } from '@angular/router';
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
            path: '',
            redirectTo: 'login',
            pathMatch: 'full'
        }
    ]
}];
