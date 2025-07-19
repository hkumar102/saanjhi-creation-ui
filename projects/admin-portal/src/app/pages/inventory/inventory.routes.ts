// inventory.routes.ts

import { Routes } from '@angular/router';
import { InventoryFormComponent } from './components/form/inventory-form.component';
import { InventoryListComponent } from './components/list/inventory-list.component';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: InventoryListComponent
  },
  {
    path: 'add',
    component: InventoryFormComponent
  },
  {
    path: 'edit/:id',
    component: InventoryFormComponent
  }
];