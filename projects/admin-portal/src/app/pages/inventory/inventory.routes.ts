import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./inventory-dashboard/inventory-dashboard.component').then(c => c.InventoryDashboardComponent)
    },
    {
        path: 'calendar',
        loadComponent: () => import('./inventory-calendar/inventory-calendar.component').then(c => c.InventoryCalendarComponent)
    },
    {
        path: 'reports',
        loadComponent: () => import('./inventory-reports/inventory-reports.component').then(c => c.InventoryReportsComponent)
    }
];