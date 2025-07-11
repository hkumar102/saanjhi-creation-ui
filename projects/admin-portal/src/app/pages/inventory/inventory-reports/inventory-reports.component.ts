import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AnalyticsChartComponent, ChartData } from '@saanjhi-creation-ui/shared-ui';
import { InventoryService } from '../services/inventory.service';
import { AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';

interface ReportFilter {
    dateRange: Date[];
    productCategory: string;
    reportType: string;
}

interface InventoryReport {
    summary: {
        totalProducts: number;
        totalRevenue: number;
        averageUtilization: number;
        topPerformingProduct: string;
        mostProfitableMonth: string;
    };
    productPerformance: ProductPerformanceReport[];
    utilizationTrends: UtilizationTrendReport[];
    revenueAnalysis: RevenueAnalysisReport;
    maintenanceReport: MaintenanceReport[];
}

interface ProductPerformanceReport {
    productId: string;
    productName: string;
    category: string;
    totalRentals: number;
    totalRevenue: number;
    averageRentalDuration: number;
    utilizationRate: number;
    profitMargin: number;
    rating: number;
}

interface UtilizationTrendReport {
    month: string;
    totalProducts: number;
    rentedProducts: number;
    utilizationRate: number;
    revenue: number;
}

interface RevenueAnalysisReport {
    monthlyRevenue: { month: string; revenue: number; }[];
    categoryRevenue: { category: string; revenue: number; percentage: number; }[];
    topProducts: { name: string; revenue: number; }[];
}

interface MaintenanceReport {
    productId: string;
    productName: string;
    lastMaintenance: Date;
    nextMaintenance: Date;
    maintenanceCost: number;
    condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    recommendedAction: string;
}

@Component({
    selector: 'app-inventory-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        DropdownModule,
        CalendarModule,
        ChartModule,
        TabViewModule,
        TagModule,
        ProgressBarModule,
        AnalyticsChartComponent,
        AppCurrencyPipe
    ],
    templateUrl: './inventory-reports.component.html',
    styles: [`
    .performance-excellent { color: #10B981; }
    .performance-good { color: #F59E0B; }
    .performance-poor { color: #EF4444; }
  `]
})
export class InventoryReportsComponent implements OnInit {
    private inventoryService = inject(InventoryService);

    // Filter properties
    filters: ReportFilter = {
        dateRange: [],
        productCategory: '',
        reportType: 'standard'
    };

    categoryOptions = [
        { label: 'Wedding Equipment', value: 'wedding' },
        { label: 'Party Supplies', value: 'party' },
        { label: 'Sound Systems', value: 'audio' },
        { label: 'Lighting', value: 'lighting' },
        { label: 'Furniture', value: 'furniture' }
    ];

    reportTypeOptions = [
        { label: 'Standard Report', value: 'standard' },
        { label: 'Detailed Analysis', value: 'detailed' },
        { label: 'Executive Summary', value: 'executive' },
        { label: 'Financial Focus', value: 'financial' }
    ];

    // Report data
    report = signal<InventoryReport | null>(null);
    loading = signal<boolean>(false);

    async ngOnInit() {
        await this.inventoryService.loadInventoryData();
        await this.generateReport();
    }

    async generateReport() {
        this.loading.set(true);
        try {
            // Simulate report generation delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockReport: InventoryReport = this.generateMockReport();
            this.report.set(mockReport);
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            this.loading.set(false);
        }
    }

    private generateMockReport(): InventoryReport {
        const inventory = this.inventoryService.inventory();

        return {
            summary: {
                totalProducts: inventory.length,
                totalRevenue: inventory.reduce((sum, item) => sum + item.revenue, 0),
                averageUtilization: inventory.reduce((sum, item) => sum + (100 - item.availabilityRate), 0) / inventory.length,
                topPerformingProduct: inventory.sort((a, b) => b.revenue - a.revenue)[0]?.product.name || 'N/A',
                mostProfitableMonth: 'March 2024'
            },
            productPerformance: inventory.map(item => ({
                productId: item.product.id,
                productName: item.product.name!,
                category: item.product.categoryName || 'Uncategorized',
                totalRentals: item.currentRentals.length + item.upcomingRentals.length,
                totalRevenue: item.revenue,
                averageRentalDuration: 5, // Mock data
                utilizationRate: 100 - item.availabilityRate,
                profitMargin: Math.random() * 50, // Mock data
                rating: Math.random() * 5 // Mock data
            })),
            utilizationTrends: this.generateUtilizationTrends(),
            revenueAnalysis: this.generateRevenueAnalysis(),
            maintenanceReport: this.generateMaintenanceReport(inventory)
        };
    }

    private generateUtilizationTrends(): UtilizationTrendReport[] {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(month => ({
            month,
            totalProducts: Math.floor(Math.random() * 50) + 20,
            rentedProducts: Math.floor(Math.random() * 30) + 10,
            utilizationRate: Math.random() * 100,
            revenue: Math.random() * 50000 + 10000
        }));
    }

    private generateRevenueAnalysis(): RevenueAnalysisReport {
        return {
            monthlyRevenue: [
                { month: 'Jan', revenue: 25000 },
                { month: 'Feb', revenue: 30000 },
                { month: 'Mar', revenue: 35000 },
                { month: 'Apr', revenue: 28000 },
                { month: 'May', revenue: 40000 },
                { month: 'Jun', revenue: 45000 }
            ],
            categoryRevenue: [
                { category: 'Wedding Equipment', revenue: 75000, percentage: 40 },
                { category: 'Party Supplies', revenue: 45000, percentage: 24 },
                { category: 'Sound Systems', revenue: 37500, percentage: 20 },
                { category: 'Lighting', revenue: 22500, percentage: 12 },
                { category: 'Furniture', revenue: 7500, percentage: 4 }
            ],
            topProducts: [
                { name: 'Wedding Chairs (Set of 100)', revenue: 15000 },
                { name: 'Professional Sound System', revenue: 12000 },
                { name: 'LED Lighting Kit', revenue: 10000 },
                { name: 'Round Tables (Set of 10)', revenue: 8000 },
                { name: 'Stage Platform', revenue: 7500 }
            ]
        };
    }

    private generateMaintenanceReport(inventory: any[]): MaintenanceReport[] {
        const conditions: MaintenanceReport['condition'][] = ['Excellent', 'Good', 'Fair', 'Poor'];

        return inventory.slice(0, 10).map(item => {
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            return {
                productId: item.product.id,
                productName: item.product.name,
                lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
                nextMaintenance: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
                maintenanceCost: Math.random() * 5000 + 500,
                condition,
                recommendedAction: this.getRecommendedAction(condition)
            };
        });
    }

    private getRecommendedAction(condition: MaintenanceReport['condition']): string {
        const actions = {
            'Excellent': 'Continue regular maintenance schedule',
            'Good': 'Monitor condition, schedule minor repairs',
            'Fair': 'Schedule comprehensive maintenance soon',
            'Poor': 'Immediate maintenance required'
        };
        return actions[condition];
    }

    // Chart data methods
    getRevenueTrendChart() {
        const revenueData = this.report()?.revenueAnalysis.monthlyRevenue || [];
        return {
            labels: revenueData.map(item => item.month),
            datasets: [{
                label: 'Revenue',
                data: revenueData.map(item => item.revenue),
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3B82F6',
                borderWidth: 2,
                fill: true
            }]
        };
    }

    getCategoryRevenueChart() {
        const categoryData = this.report()?.revenueAnalysis.categoryRevenue || [];
        return {
            labels: categoryData.map(item => item.category),
            datasets: [{
                data: categoryData.map(item => item.revenue),
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444']
            }]
        } as ChartData;
    }

    getUtilizationTrendChart() {
        const utilizationData = this.report()?.utilizationTrends || [];
        return {
            labels: utilizationData.map(item => item.month),
            datasets: [{
                label: 'Utilization Rate (%)',
                data: utilizationData.map(item => item.utilizationRate),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10B981',
                borderWidth: 1
            }]
        };
    }

    // Utility methods
    getPerformanceRating(rating: number): string {
        if (rating >= 4) return 'Excellent';
        if (rating >= 3) return 'Good';
        if (rating >= 2) return 'Average';
        return 'Poor';
    }

    getPerformanceSeverity(rating: number): 'success' | 'warning' | 'info' | 'danger' {
        if (rating >= 4) return 'success';
        if (rating >= 3) return 'info';
        if (rating >= 2) return 'warning';
        return 'danger';
    }

    getConditionSeverity(condition: string): 'success' | 'warning' | 'info' | 'danger' {
        const severities: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
            'Excellent': 'success',
            'Good': 'info',
            'Fair': 'warning',
            'Poor': 'danger'
        };
        return severities[condition] || 'info';
    }

    isMaintenanceOverdue(nextMaintenance: Date): boolean {
        return new Date(nextMaintenance) < new Date();
    }

    // Export methods
    exportPDF() {
        console.log('Exporting PDF report...');
        // Implement PDF export functionality
    }

    exportExcel() {
        console.log('Exporting Excel report...');
        // Implement Excel export functionality
    }

    scheduleReport() {
        console.log('Scheduling automatic report...');
        // Implement report scheduling functionality
    }
}