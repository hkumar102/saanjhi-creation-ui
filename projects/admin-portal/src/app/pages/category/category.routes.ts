import { Routes } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryFormComponent } from './category-form/category-form.component';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  },
  {
    path: 'create',
    component: CategoryFormComponent,
  },
  {
    path: 'edit/:id',
    component: CategoryFormComponent,
  }
];