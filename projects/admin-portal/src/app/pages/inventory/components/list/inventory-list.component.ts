import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { InventoryServiceClient, InventoryItemDto, SearchInventoryQuery, InventoryStatusLabelPipe } from '@saanjhi-creation-ui/shared-common';
import { BadgeModule } from 'primeng/badge';
import { Button, ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InventoryFilterComponent } from './inventory-filter/inventory-filter.component';
import { UiConfirmDialogComponent, UiButtonComponent } from "@saanjhi-creation-ui/shared-ui";
import { RouterModule } from '@angular/router';
import { SpeedDialModule } from 'primeng/speeddial';
import { AdminBaseComponent } from '../../../../common/components/base/admin-base.component';
import { MenuItem } from 'primeng/api';
import { ImageModule } from 'primeng/image'

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
    RouterModule,
    SpeedDialModule,
    ImageModule,
    InventoryStatusLabelPipe,
    UiButtonComponent
],
    templateUrl: './inventory-list.component.html',
    styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent extends AdminBaseComponent implements OnInit {
    private inventoryService = inject(InventoryServiceClient);

    @ViewChild('confirmDialog') confirmDialog!: UiConfirmDialogComponent;


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
        this.navigation.goTo(`/inventory/edit/${item.id}`);
    }

    getActionItems(item: InventoryItemDto) {
        return [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => this.editItem(item)

            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => this.toast.info('Delete action not implemented yet')
            },
            {
                label: 'Print Barcode',
                icon: 'pi pi-eye',
                command: () => this.printBarcode(item)
            }
        ] as MenuItem[];
    }

    printBarcode(item: any) {
        const printWindow = window.open('', '_blank', 'width=400,height=300');
        if (printWindow) {
            // Create the document structure
            printWindow.document.title = 'Print Barcode';
            const style = printWindow.document.createElement('style');
            style.textContent = `
      body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      img { max-width: 300px; max-height: 120px; }
    `;
            printWindow.document.head.appendChild(style);

            const img = printWindow.document.createElement('img');
            img.src = `data:image/png;base64,${item.barcodeImageBase64}`;
            img.alt = 'Barcode';
            printWindow.document.body.appendChild(img);

            // Wait for image to load before printing
            img.onload = () => printWindow.print();
            // Fallback in case onload doesn't fire
            setTimeout(() => printWindow.print(), 1000);
        }
    }

    onDeleteClicked(item: InventoryItemDto) {}
}