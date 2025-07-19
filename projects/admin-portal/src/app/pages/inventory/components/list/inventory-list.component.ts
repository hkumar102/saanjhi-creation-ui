import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InventoryServiceClient, InventoryItemDto, SearchInventoryQuery } from '@saanjhi-creation-ui/shared-common';
import { BadgeModule } from 'primeng/badge';
import { Button, ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InventoryFilterComponent } from './inventory-filter/inventory-filter.component';
import { UiConfirmDialogComponent } from "@saanjhi-creation-ui/shared-ui";
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-inventory-list',
    standalone: true,
    imports: [
        BadgeModule,
        TableModule,
        ButtonModule,
        CommonModule,
        InventoryFilterComponent,
        UiConfirmDialogComponent,
        RouterModule
    ],
    templateUrl: './inventory-list.component.html',
    styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
    items: InventoryItemDto[] = [];
    products: any[] = [];
    totalCount = 0;
    pageSize = 20;
    isLoading = false;
    sortField = 'serialNumber';
    sortOrder = 1;
    filters: any = {
        includeRetired: true
    };

    constructor(private inventoryService: InventoryServiceClient) { }

    ngOnInit(): void {
        this.loadProducts();
        this.loadItems();
    }

    onFiltersChanged(filters: any) {
        this.filters = filters;
        this.loadItems(0);
    }

    onLazyLoad(event: any) {
        this.pageSize = event.rows;
        this.sortField = event.sortField || 'serialNumber';
        this.sortOrder = event.sortOrder || 1;
        this.loadItems(event.first / event.rows);
    }

    async loadItems(page: number = 0) {
        this.isLoading = true;
        const query: SearchInventoryQuery = {
            ...this.filters,
            page: page + 1,
            pageSize: this.pageSize,
            sortBy: this.sortField,
            sortDesc: this.sortOrder === -1
        };
        const result = await this.inventoryService.search(query);
        this.items = result.items || result;
        this.totalCount = result.totalCount || 0;
        this.isLoading = false;
    }

    loadProducts() {
        // TODO: Load product list for filter dropdown (implement as needed)
        this.products = [];
    }

    editItem(item: InventoryItemDto) {
        // TODO: Implement navigation to edit form
        console.log('Edit', item);
    }
}