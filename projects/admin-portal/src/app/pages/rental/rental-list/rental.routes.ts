import { Routes } from "@angular/router";
import { RentalListComponent } from "./rental-list.component";
import { RentalFormComponent } from "../rental-form/rental-form.component";

export const RENTAL_ROUTES: Routes = [
    {
        path: '',
        component: RentalListComponent,
    },
    {
        path: 'create',
        component: RentalFormComponent,
    },
    {
        path: 'edit/:id',
        component: RentalFormComponent,
    }
];