import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';
import { RentalServiceClient, ProductServiceClient, CustomerServiceClient } from '@saanjhi-creation-ui/shared-common';

export interface DashboardMetrics {
    totalRevenue: number;
    totalRentals: number;
    activeCustomers: number;
    availableProducts: number;
    revenueGrowth: string;
    rentalGrowth: string;
    customerGrowth: string;
    productGrowth: string;
}

export interface RevenueChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private rentalClient = inject(RentalServiceClient);
    private productClient = inject(ProductServiceClient);
    private customerClient = inject(CustomerServiceClient);

    metrics = signal<DashboardMetrics>({
        totalRevenue: 0,
        totalRentals: 0,
        activeCustomers: 0,
        availableProducts: 0,
        revenueGrowth: '+0%',
        rentalGrowth: '+0%',
        customerGrowth: '+0%',
        productGrowth: '+0%'
    });

    revenueChart = signal<RevenueChartData>({
        labels: [],
        datasets: []
    });

    topProducts = signal<any[]>([]);
    recentRentals = signal<any[]>([]);
    upcomingReturns = signal<any[]>([]);

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadMetrics(),
                this.loadRevenueChart(),
                this.loadTopProducts(),
                this.loadRecentRentals(),
                this.loadUpcomingReturns()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    private async loadMetrics() {
        // Mock data - replace with actual API calls
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        // Get current month data
        const currentRentals = await this.rentalClient.getRentals({
            fromDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
            toDate: currentDate.toISOString(),
            page: 1,
            pageSize: 1000
        });

        // Get last month data for comparison
        const lastMonthRentals = await this.rentalClient.getRentals({
            fromDate: lastMonth.toISOString(),
            toDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString(),
            page: 1,
            pageSize: 1000
        });

        const totalRevenue = currentRentals.items?.reduce((sum, rental) => sum + (rental.rentalPrice || 0), 0) || 0;
        const lastMonthRevenue = lastMonthRentals.items?.reduce((sum, rental) => sum + (rental.rentalPrice || 0), 0) || 0;

        const revenueGrowth = lastMonthRevenue > 0
            ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : '0';

        const [productsResult, customersResult] = await Promise.all([
            this.productClient.getAll({ page: 1, pageSize: 1000 }),
            this.customerClient.getCustomers({ page: 1, pageSize: 1000 })
        ]);

        this.metrics.set({
            totalRevenue,
            totalRentals: currentRentals.totalCount || 0,
            activeCustomers: customersResult.totalCount || 0,
            availableProducts: productsResult.items?.filter(p => p.isActive).length || 0,
            revenueGrowth: `${revenueGrowth.startsWith('-') ? '' : '+'}${revenueGrowth}%`,
            rentalGrowth: '+12%', // Calculate based on actual data
            customerGrowth: '+8%', // Calculate based on actual data
            productGrowth: '+3%'   // Calculate based on actual data
        });
    }

    private async loadRevenueChart() {
        // Get last 6 months data
        const months = [];
        const revenues = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const rentals = await this.rentalClient.getRentals({
                fromDate: startDate.toISOString(),
                toDate: endDate.toISOString(),
                page: 1,
                pageSize: 1000
            });

            const monthRevenue = rentals.items?.reduce((sum, rental) => sum + (rental.rentalPrice || 0), 0) || 0;

            months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            revenues.push(monthRevenue);
        }

        this.revenueChart.set({
            labels: months,
            datasets: [{
                label: 'Revenue',
                data: revenues,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2
            }]
        });
    }

    private async loadTopProducts() {
        // Mock data - implement actual aggregation
        this.topProducts.set([
            { name: 'Wedding Chairs', rentals: 15, revenue: 4500 },
            { name: 'Party Tables', rentals: 12, revenue: 3600 },
            { name: 'Sound System', rentals: 8, revenue: 2400 },
            { name: 'Lighting Kit', rentals: 6, revenue: 1800 },
            { name: 'Decorative Items', rentals: 10, revenue: 1500 }
        ]);
    }

    private async loadRecentRentals() {
        const rentals = await this.rentalClient.getRentals({
            page: 1,
            pageSize: 5,
            sortBy: 'createdAt',
            descending: true
        });

        this.recentRentals.set(rentals.items || []);
    }

    private async loadUpcomingReturns() {
        // Get rentals ending in next 7 days
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const rentals = await this.rentalClient.getRentals({
            toDate: nextWeek.toISOString(),
            page: 1,
            pageSize: 10
        });

        this.upcomingReturns.set(rentals.items || []);
    }
}