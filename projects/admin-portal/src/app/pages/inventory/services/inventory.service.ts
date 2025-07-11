import { Injectable, inject, signal } from '@angular/core';
import {
    ProductServiceClient,
    RentalServiceClient,
    ProductDto,
    RentalDto
} from '@saanjhi-creation-ui/shared-common';

export interface InventoryItem {
    product: ProductDto;
    totalQuantity: number;
    availableQuantity: number;
    rentedQuantity: number;
    maintenanceQuantity: number;
    availabilityRate: number;
    currentRentals: RentalDto[];
    upcomingRentals: RentalDto[];
    revenue: number;
    status: 'available' | 'low-stock' | 'out-of-stock' | 'maintenance';
}

export interface InventoryMetrics {
    totalProducts: number;
    totalValue: number;
    availableProducts: number;
    rentedProducts: number;
    maintenanceProducts: number;
    lowStockProducts: number;
    averageUtilization: number;
    monthlyRevenue: number;
}

export interface InventoryCalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    productId: string;
    productName: string;
    customerName: string;
    type: 'rental' | 'maintenance' | 'reserved';
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private productClient = inject(ProductServiceClient);
    private rentalClient = inject(RentalServiceClient);

    // Signals for reactive data
    inventory = signal<InventoryItem[]>([]);
    metrics = signal<InventoryMetrics>({
        totalProducts: 0,
        totalValue: 0,
        availableProducts: 0,
        rentedProducts: 0,
        maintenanceProducts: 0,
        lowStockProducts: 0,
        averageUtilization: 0,
        monthlyRevenue: 0
    });
    calendarEvents = signal<InventoryCalendarEvent[]>([]);
    loading = signal<boolean>(false);

    async loadInventoryData() {
        this.loading.set(true);
        try {
            await Promise.all([
                this.loadInventory(),
                this.loadMetrics(),
                this.loadCalendarEvents()
            ]);
        } catch (error) {
            console.error('Error loading inventory data:', error);
        } finally {
            this.loading.set(false);
        }
    }

    private async loadInventory() {
        const [productsResult, rentalsResult] = await Promise.all([
            this.productClient.getAll({ page: 1, pageSize: 1000 }),
            this.rentalClient.getRentals({ page: 1, pageSize: 1000 })
        ]);

        const products = productsResult.items || [];
        const rentals = rentalsResult.items || [];

        const inventory: InventoryItem[] = products.map(product => {
            const productRentals = rentals.filter(r => r.product.id === product.id);
            const currentRentals = productRentals.filter(r => this.isCurrentRental(r));
            const upcomingRentals = productRentals.filter(r => this.isUpcomingRental(r));

            const totalQuantity = product.quantity || 1;
            const rentedQuantity = currentRentals.length;
            const maintenanceQuantity = 0;
            const availableQuantity = totalQuantity - rentedQuantity - maintenanceQuantity;

            const revenue = productRentals.reduce((sum, rental) =>
                sum + (rental.rentalPrice || 0), 0);

            const availabilityRate = totalQuantity > 0
                ? (availableQuantity / totalQuantity) * 100
                : 0;

            let status: InventoryItem['status'] = 'available';
            if (maintenanceQuantity > 0) status = 'maintenance';
            else if (availableQuantity === 0) status = 'out-of-stock';
            else if (availableQuantity <= (totalQuantity * 0.2)) status = 'low-stock';

            return {
                product,
                totalQuantity,
                availableQuantity,
                rentedQuantity,
                maintenanceQuantity,
                availabilityRate,
                currentRentals : productRentals,
                upcomingRentals,
                revenue,
                status
            };
        });

        this.inventory.set(inventory);
    }

    private async loadMetrics() {
        const inventory = this.inventory();

        const metrics: InventoryMetrics = {
            totalProducts: inventory.length,
            totalValue: inventory.reduce((sum, item) =>
                sum + (item.product.price || 0) * item.totalQuantity, 0),
            availableProducts: inventory.filter(item => item.availableQuantity > 0).length,
            rentedProducts: inventory.filter(item => item.rentedQuantity > 0).length,
            maintenanceProducts: inventory.filter(item => item.maintenanceQuantity > 0).length,
            lowStockProducts: inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length,
            averageUtilization: inventory.length > 0
                ? inventory.reduce((sum, item) => sum + (100 - item.availabilityRate), 0) / inventory.length
                : 0,
            monthlyRevenue: inventory.reduce((sum, item) => sum + item.revenue, 0)
        };

        this.metrics.set(metrics);
    }

    private async loadCalendarEvents() {
        const rentals = await this.rentalClient.getRentals({
            fromDate: new Date().toISOString(),
            page: 1,
            pageSize: 1000
        });

        const events: InventoryCalendarEvent[] = (rentals.items || []).map(rental => ({
            id: rental.id,
            title: `${rental.product?.name} - ${rental.customer?.name}`,
            start: new Date(rental.startDate),
            end: new Date(rental.endDate),
            productId: rental.product.id,
            productName: rental.product?.name || 'Unknown Product',
            customerName: rental.customer?.name || 'Unknown Customer',
            type: 'rental' as const,
            color: this.getRentalColor(rental)
        }));

        this.calendarEvents.set(events);
    }

    private isCurrentRental(rental: RentalDto): boolean {
        const today = new Date();
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        return today >= start && today <= end;
    }

    private isUpcomingRental(rental: RentalDto): boolean {
        const today = new Date();
        const start = new Date(rental.startDate);
        return start > today;
    }

    private getRentalColor(rental: RentalDto): string {
        const today = new Date();
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);

        if (today >= start && today <= end) return '#10B981'; // Green - Active
        if (start > today) return '#3B82F6'; // Blue - Upcoming
        if (end < today) return '#6B7280'; // Gray - Completed
        return '#F59E0B'; // Yellow - Default
    }

    // Utility methods
    getProductAvailability(productId: string, startDate: Date, endDate: Date): boolean {
        const item = this.inventory().find(i => i.product.id === productId);
        if (!item) return false;

        const conflictingRentals = [...item.currentRentals, ...item.upcomingRentals]
            .filter(rental => {
                const rentalStart = new Date(rental.startDate);
                const rentalEnd = new Date(rental.endDate);
                return !(endDate <= rentalStart || startDate >= rentalEnd);
            });

        return conflictingRentals.length < item.totalQuantity;
    }

    updateProductQuantity(productId: string, quantity: number) {
        // Update product quantity - implement API call
    }

    markProductForMaintenance(productId: string, maintenanceQuantity: number) {
        // Mark product for maintenance - implement API call
    }
}