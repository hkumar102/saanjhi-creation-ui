import { Routes } from "@angular/router";
import { UserFormComponent } from "./user-form/user-form.component";
import { UserListComponent } from "./user-list/user-list.component";

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserListComponent,
    },
    {
        path: 'create',
        component: UserFormComponent,
    },
    {
        path: 'edit/:id',
        component: UserFormComponent,
    }
];