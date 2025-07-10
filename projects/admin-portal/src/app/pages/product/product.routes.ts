import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';

export const productRoutes: Routes = [
    {
        path: '',
        component: ProductListComponent,
        title: 'Products'
    },
    {
        path: 'create',
        component: ProductFormComponent,
        title: 'Create Product'
    },
    {
        path: 'edit/:id',
        component: ProductFormComponent,
        title: 'Edit Product'
    },
    {
        path: 'details/:id',
        loadComponent: () => import('./product-details/product-details.component').then(m => m.ProductDetailsPageComponent),
        title: 'Product Details'
    }
];
