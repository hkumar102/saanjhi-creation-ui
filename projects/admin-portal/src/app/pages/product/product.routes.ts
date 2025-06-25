import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form.component';
import { ProductCreateComponent } from './product-create.component';
import { ProductEditComponent } from './product-edit.component';

export const productRoutes: Routes = [
    {
        path: '',
        component: ProductListComponent,
        title: 'Products'
    },
    {
        path: 'create',
        component: ProductCreateComponent,
        title: 'Create Product'
    },
    {
        path: 'edit/:id',
        component: ProductEditComponent,
        title: 'Edit Product'
    }
];
