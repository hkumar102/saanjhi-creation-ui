// inventory.routes.ts

import { Routes } from '@angular/router';
import { InventoryFormComponent } from './components/form/inventory-form.component';
import { InventoryListComponent } from './components/list/inventory-list.component';
export const INVENTORY_PATH = {
  LIST: 'list',
  ADD: 'add',
  EDIT: 'edit/:id',
  DETAILS: 'details/:id'
}
export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: INVENTORY_PATH.LIST,
    pathMatch: 'full'
  },
  {
    path: INVENTORY_PATH.LIST,
    component: InventoryListComponent
  },
  {
    path: INVENTORY_PATH.ADD,
    component: InventoryFormComponent
  },
  {
    path: INVENTORY_PATH.EDIT,
    component: InventoryFormComponent
  },
  {
    path: INVENTORY_PATH.DETAILS,
    loadComponent: () => import('./components/details/inventory-details.component').then(m => m.InventoryDetailsComponent)
  }
];