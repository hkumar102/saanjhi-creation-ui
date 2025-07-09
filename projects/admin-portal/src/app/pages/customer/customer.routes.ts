import { Routes } from "@angular/router";
import { CustomerListComponent } from "./customer-list/customer-list.component";
import { CustomerFormComponent } from "./customer-form/customer-form.component";

export const CUSTOMER_ROUTES: Routes = [
    {
        path: '',
        component: CustomerListComponent,
    },
    {
        path: 'create',
        component: CustomerFormComponent,
    },
    {
        path: 'edit/:id',
        component: CustomerFormComponent,
    }
];