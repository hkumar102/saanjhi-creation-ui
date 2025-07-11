import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { MetricCardComponent, AnalyticsChartComponent, ChartData } from '@saanjhi-creation-ui/shared-ui';
import { InventoryService, InventoryItem } from '../services/inventory.service';
import { AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';

@Component({
    selector: 'app-inventory-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        TagModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        ProgressBarModule,
        ChartModule,
        CalendarModule,
        DialogModule,
        MetricCardComponent,
        AnalyticsChartComponent,
        AppCurrencyPipe
    ],
    templateUrl: './inventory-dashboard.component.html',
    styles: [`
    .field-group {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--surface-border);
    }
    
    .field-group label {
      font-weight: 500;
      color: var(--text-color-secondary);
    }
  `]
})
export class InventoryDashboardComponent implements OnInit {
    inventoryService = inject(InventoryService);

    // Filter properties
    searchTerm = '';
    selectedStatus = '';
    selectedCategory = '';
    filteredInventory: InventoryItem[] = [];

    // Dialog properties
    showDetailsDialog = false;
    selectedProduct: InventoryItem | null = null;

    // Filter options
    statusOptions = [
        { label: 'Available', value: 'available' },
        { label: 'Low Stock', value: 'low-stock' },
        { label: 'Out of Stock', value: 'out-of-stock' },
        { label: 'Maintenance', value: 'maintenance' }
    ];

    categoryOptions: any[] = [];

    async ngOnInit() {
        await this.inventoryService.loadInventoryData();
        this.updateFilteredInventory();
        this.loadCategoryOptions();
    }

    private updateFilteredInventory() {
        let filtered = this.inventoryService.inventory();

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(item =>
                item.product.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.product.categoryName?.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (this.selectedStatus) {
            filtered = filtered.filter(item => item.status === this.selectedStatus);
        }

        // Apply category filter
        if (this.selectedCategory) {
            filtered = filtered.filter(item => item.product.categoryId === this.selectedCategory);
        }

        this.filteredInventory = filtered;
    }

    private loadCategoryOptions() {
        const categories = new Set(
            this.inventoryService.inventory()
                .map(item => item.product)
                .filter(category => category)
        );

        this.categoryOptions = Array.from(categories).map(category => ({
            label: category?.categoryName,
            value: category?.categoryId
        }));
    }

    // Event handlers
    onSearch() {
        this.updateFilteredInventory();
    }

    onStatusFilter() {
        this.updateFilteredInventory();
    }

    onCategoryFilter() {
        this.updateFilteredInventory();
    }

    // Utility methods
    getAvailabilityTrend(): string {
        const metrics = this.inventoryService.metrics();
        const rate = metrics.totalProducts > 0
            ? (metrics.availableProducts / metrics.totalProducts) * 100
            : 0;
        return `${rate.toFixed(0)}%`;
    }

    getUtilizationTrend(): string {
        return `${this.inventoryService.metrics().averageUtilization.toFixed(0)}%`;
    }

    getAlerts() {
        const inventory = this.inventoryService.inventory();
        const alerts = [];

        const lowStock = inventory.filter(item => item.status === 'low-stock').length;
        const outOfStock = inventory.filter(item => item.status === 'out-of-stock').length;
        const maintenance = inventory.filter(item => item.status === 'maintenance').length;

        if (lowStock > 0) {
            alerts.push({
                message: `${lowStock} products are low in stock`,
                severity: 'warning' as const
            });
        }

        if (outOfStock > 0) {
            alerts.push({
                message: `${outOfStock} products are out of stock`,
                severity: 'danger' as const
            });
        }

        if (maintenance > 0) {
            alerts.push({
                message: `${maintenance} products are under maintenance`,
                severity: 'info' as const
            });
        }

        return alerts;
    }

    getUtilizationChartData() {
        const metrics = this.inventoryService.metrics();
        return {
            labels: ['Available', 'Rented', 'Maintenance'],
            datasets: [{
                data: [
                    metrics.availableProducts,
                    metrics.rentedProducts,
                    metrics.maintenanceProducts
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#6B7280']
            }]
        } as ChartData;
    }

    getStatusChartData() {
        const inventory = this.inventoryService.inventory();
        const statusCounts = {
            available: inventory.filter(i => i.status === 'available').length,
            'low-stock': inventory.filter(i => i.status === 'low-stock').length,
            'out-of-stock': inventory.filter(i => i.status === 'out-of-stock').length,
            maintenance: inventory.filter(i => i.status === 'maintenance').length
        };

        return {
            labels: ['Available', 'Low Stock', 'Out of Stock', 'Maintenance'],
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280']
            }]
        } as ChartData;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'available': 'Available',
            'low-stock': 'Low Stock',
            'out-of-stock': 'Out of Stock',
            'maintenance': 'Maintenance'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
        const severities: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
            'available': 'success',
            'low-stock': 'warning',
            'out-of-stock': 'danger',
            'maintenance': 'info'
        };
        return severities[status] || 'info';
    }

    getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            'available': 'pi pi-check-circle',
            'low-stock': 'pi pi-exclamation-triangle',
            'out-of-stock': 'pi pi-times-circle',
            'maintenance': 'pi pi-wrench'
        };
        return icons[status] || 'pi pi-circle';
    }

    getUtilizationColor(availabilityRate: number): string {
        const utilization = 100 - availabilityRate;
        if (utilization >= 80) return '#10B981'; // Green - High utilization
        if (utilization >= 50) return '#F59E0B'; // Yellow - Medium utilization
        return '#EF4444'; // Red - Low utilization
    }

    // Action methods
    viewDetails(item: InventoryItem) {
        this.selectedProduct = item;
        this.showDetailsDialog = true;
    }

    editProduct(item: InventoryItem) {
        // Navigate to product edit form
    }

    viewSchedule(item: InventoryItem) {
        // Open calendar view for this product
    }

    scheduleProductMaintenance(item: InventoryItem) {
        // Open maintenance scheduling dialog
    }

    addProduct() {
        // Navigate to add product form
    }

    bulkUpdate() {
        // Open bulk update dialog
    }

    scheduleMaintenance() {
        // Open maintenance scheduling dialog
    }

    stockReplenishment() {
        // Open stock replenishment dialog
    }

    generateReport() {
        // Generate inventory report
    }

    exportInventory() {
        // Export inventory to CSV/Excel
    }
}