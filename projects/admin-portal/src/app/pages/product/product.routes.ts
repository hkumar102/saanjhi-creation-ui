import { Routes } from '@angular/router';
import { ProductWorkflowComponent } from './components/workflow/product-workflow/product-workflow.component';
import { ProductListComponent } from './components/list/product-list.component';
export const PRODUCT_PATH = {
  CREATE: 'create',
  EDIT: 'edit/:id',
  DETAILS: 'details/:id'
}
export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
    {
      path: 'list',
      component: ProductListComponent
    },
  {
    path: PRODUCT_PATH.CREATE,
    component: ProductWorkflowComponent
    // loadComponent: () => import('./components/product-workflow/product-workflow.component').then(m => m.ProductWorkflowComponent)
  },
  {
    path: PRODUCT_PATH.EDIT,
    component: ProductWorkflowComponent
  },
  //   {
  //     path: 'details/:id',
  //     loadComponent: () => import('./product-details/product-details.component').then(m => m.ProductDetailsPageComponent)
  //   }
];
