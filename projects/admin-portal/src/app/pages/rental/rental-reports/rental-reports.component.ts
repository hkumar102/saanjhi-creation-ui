import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    computed,
    OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RentalServiceClient, RentalDto, AppMessages } from '@saanjhi-creation-ui/shared-common';
import { AdminBaseComponent } from '../../../common/components/base/admin-base.component';
import {
    UiFormFieldComponent,
    UiButtonComponent,
    UiCardComponent
} from "@saanjhi-creation-ui/shared-ui";
import { DatePickerModule } from "primeng/datepicker";
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

interface ReportData {
    dailyRentalEarnings: { date: string; amount: number }[];
    dailySecurityEarnings: { date: string; amount: number }[];
    productAnalytics: { productName: string; totalRental: number; rentalCount: number }[];
    totalRentalEarnings: number;
    totalSecurityEarnings: number;
    totalRentals: number;
    averageRentalPrice: number;
    averageSecurityDeposit: number;
}

@Component({
    selector: 'app-rental-reports',
    templateUrl: './rental-reports.component.html',
    styleUrls: ['./rental-reports.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiFormFieldComponent,
        UiButtonComponent,
        DatePickerModule,
        ChartModule,
        CardModule
    ],
})
export class RentalReportsComponent extends AdminBaseComponent implements OnInit {
    private rentalClient = inject(RentalServiceClient);
    private fb = inject(FormBuilder);

    protected readonly ReportMessages = this.Messages.reports;

    // Form for date range selection
    reportForm: FormGroup = this.fb.group({
        startDate: [this.getDefaultStartDate(), Validators.required],
        endDate: [this.getDefaultEndDate(), Validators.required]
    });

    // Signals for state management
    loading = signal(false);
    reportData = signal<ReportData | null>(null);

    // Chart data computed from report data
    rentalChartData = computed(() => this.generateChartData('rental'));
    securityChartData = computed(() => this.generateChartData('security'));
    chartOptions = computed(() => this.getChartOptions());

    // Product analytics computed properties
    productRentalSumData = computed(() => this.generateProductChartData('sum'));
    productRentalCountData = computed(() => this.generateProductChartData('count'));
    productCombinedData = computed(() => this.generateProductCombinedData());

    ngOnInit() {
        this.loadReportData();
    }

    private getDefaultStartDate(): Date {
        const date = new Date();
        date.setMonth(date.getMonth() - 1); // Last month
        return date;
    }

    private getDefaultEndDate(): Date {
        return new Date(); // Today
    }

    async loadReportData() {
        if (this.reportForm.invalid) {
            this.toast.error(this.ReportMessages.dateRangeRequired);
            return;
        }

        this.loading.set(true);

        try {
            const { startDate, endDate } = this.reportForm.value;

            // Fetch all rentals in the date range
            const rentals = await this.fetchRentalsInRange(startDate, endDate);

            // Process data for reporting
            const reportData = this.processRentalData(rentals, startDate, endDate);

            this.reportData.set(reportData);

        } catch (error) {
            this.toast.error(this.ReportMessages.loadReportError);
        } finally {
            this.loading.set(false);
        }
    }

    private async fetchRentalsInRange(startDate: Date, endDate: Date): Promise<RentalDto[]> {
        try {
            // Fetch rentals with pagination (get all pages)
            let allRentals: RentalDto[] = [];
            let page = 1;
            let hasMore = true;
            const pageSize = 100;

            while (hasMore) {
                const result = await this.rentalClient.getRentals({
                    page,
                    pageSize,
                    fromDate: startDate.toISOString(),
                    toDate: endDate.toISOString(),
                    sortBy: 'startDate',
                    descending: false
                });

                if (result.items && result.items.length > 0) {
                    allRentals.push(...result.items);
                    hasMore = result.items.length === pageSize;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            return allRentals;
        } catch (error) {
            return [];
        }
    }

    private processRentalData(rentals: RentalDto[], startDate: Date, endDate: Date): ReportData {
        // Group rentals by date
        const dailyRentalEarnings = new Map<string, number>();
        const dailySecurityEarnings = new Map<string, number>();

        let totalRentalEarnings = 0;
        let totalSecurityEarnings = 0;

        // Process each rental
        rentals.forEach(rental => {
            const rentalDate = new Date(rental.startDate).toISOString().split('T')[0]; // YYYY-MM-DD format

            // Accumulate daily earnings
            dailyRentalEarnings.set(
                rentalDate,
                (dailyRentalEarnings.get(rentalDate) || 0) + rental.rentalPrice
            );

            dailySecurityEarnings.set(
                rentalDate,
                (dailySecurityEarnings.get(rentalDate) || 0) + rental.securityDeposit
            );

            // Accumulate totals
            totalRentalEarnings += rental.rentalPrice;
            totalSecurityEarnings += rental.securityDeposit;
        });

        // Generate date range array and fill missing dates with 0
        const dateRange = this.generateDateRange(startDate, endDate);

        const dailyRentalArray = dateRange.map(date => ({
            date,
            amount: dailyRentalEarnings.get(date) || 0
        }));

        const dailySecurityArray = dateRange.map(date => ({
            date,
            amount: dailySecurityEarnings.get(date) || 0
        }));

        // Process product analytics
        const productMap = new Map<string, { totalRental: number; rentalCount: number }>();

        rentals.forEach(rental => {
            const productName = rental.product?.name || 'Unknown Product';
            const current = productMap.get(productName) || { totalRental: 0, rentalCount: 0 };

            productMap.set(productName, {
                totalRental: current.totalRental + rental.rentalPrice,
                rentalCount: current.rentalCount + 1
            });
        });

        const productAnalytics = Array.from(productMap.entries())
            .map(([productName, data]) => ({
                productName,
                totalRental: data.totalRental,
                rentalCount: data.rentalCount
            }))
            .sort((a, b) => b.totalRental - a.totalRental) // Sort by total rental descending
            .slice(0, 10); // Top 10 products

        return {
            dailyRentalEarnings: dailyRentalArray,
            dailySecurityEarnings: dailySecurityArray,
            productAnalytics,
            totalRentalEarnings,
            totalSecurityEarnings,
            totalRentals: rentals.length,
            averageRentalPrice: rentals.length > 0 ? totalRentalEarnings / rentals.length : 0,
            averageSecurityDeposit: rentals.length > 0 ? totalSecurityEarnings / rentals.length : 0
        };
    }

    private generateDateRange(startDate: Date, endDate: Date): string[] {
        const dates: string[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    private generateChartData(type: 'rental' | 'security') {
        const data = this.reportData();
        if (!data) return null;

        const earnings = type === 'rental' ? data.dailyRentalEarnings : data.dailySecurityEarnings;
        const label = type === 'rental' ? 'Rental Earnings' : 'Security Deposit';
        const color = type === 'rental' ? '#42A5F5' : '#66BB6A';

        return {
            labels: earnings.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [
                {
                    label: label,
                    data: earnings.map(item => item.amount),
                    borderColor: color,
                    backgroundColor: color + '20',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    }

    private getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context: any) => {
                            return `${context.dataset.label}: ₹${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    },
                    ticks: {
                        callback: (value: any) => '₹' + value.toLocaleString()
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };
    }

    private generateProductChartData(type: 'sum' | 'count') {
        const data = this.reportData();
        if (!data || !data.productAnalytics.length) return null;

        const products = data.productAnalytics;
        const values = type === 'sum'
            ? products.map(p => p.totalRental)
            : products.map(p => p.rentalCount);

        const label = type === 'sum' ? 'Total Rental Amount' : 'Rental Count';
        const color = type === 'sum' ? '#FF6B6B' : '#4ECDC4';

        return {
            labels: products.map(p => p.productName),
            datasets: [
                {
                    label: label,
                    data: values,
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1
                }
            ]
        };
    }

    private generateProductCombinedData() {
        const data = this.reportData();
        if (!data || !data.productAnalytics.length) return null;

        const products = data.productAnalytics;

        return {
            labels: products.map(p => p.productName),
            datasets: [
                {
                    label: 'Total Rental Amount (₹)',
                    data: products.map(p => p.totalRental),
                    backgroundColor: '#FF6B6B',
                    borderColor: '#FF6B6B',
                    borderWidth: 1,
                    xAxisID: 'x' // Use main x-axis for revenue
                },
                {
                    label: 'Rental Count',
                    data: products.map(p => p.rentalCount),
                    backgroundColor: '#4ECDC4',
                    borderColor: '#4ECDC4',
                    borderWidth: 1,
                    xAxisID: 'x1' // Use secondary x-axis for count
                }
            ]
        };
    }

    // Add this method to your component class
    getPerformanceScore(product: { productName: string; totalRental: number; rentalCount: number }): number {
        const data = this.reportData();
        if (!data) return 0;

        const maxRevenue = Math.max(...data.productAnalytics.map(p => p.totalRental));
        const maxCount = Math.max(...data.productAnalytics.map(p => p.rentalCount));

        if (maxRevenue === 0 && maxCount === 0) return 0;

        // Weighted score: 70% revenue, 30% frequency
        const revenueScore = maxRevenue > 0 ? (product.totalRental / maxRevenue) * 70 : 0;
        const countScore = maxCount > 0 ? (product.rentalCount / maxCount) * 30 : 0;

        return Math.round(revenueScore + countScore);
    }

    // Add these methods to your RentalReportsComponent class:

    exportReport() {
        const data = this.reportData();
        if (!data) {
            this.toast.warn(this.ReportMessages.noDataToExport);
            return;
        }

        try {
            // Create CSV content
            const csvContent = this.generateCSVReport(data);

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `rental-report-${this.formatDateForFile(new Date())}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.toast.success(this.ReportMessages.exportSuccess);
        } catch (error) {
            this.toast.error(this.ReportMessages.exportError);
        }
    }

    private generateCSVReport(data: ReportData): string {
        const { startDate, endDate } = this.reportForm.value;

        let csv = `Rental Report\n`;
        csv += `Date Range: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}\n`;
        csv += `Generated: ${new Date().toLocaleString()}\n\n`;

        // Summary section
        csv += `SUMMARY\n`;
        csv += `Total Rental Earnings,${data.totalRentalEarnings}\n`;
        csv += `Total Security Deposits,${data.totalSecurityEarnings}\n`;
        csv += `Total Rentals,${data.totalRentals}\n`;
        csv += `Average Rental Price,${data.averageRentalPrice}\n`;
        csv += `Average Security Deposit,${data.averageSecurityDeposit}\n\n`;

        // Daily earnings section
        csv += `DAILY EARNINGS\n`;
        csv += `Date,Rental Earnings,Security Deposits\n`;
        data.dailyRentalEarnings.forEach((item, index) => {
            const securityAmount = data.dailySecurityEarnings[index]?.amount || 0;
            csv += `${item.date},${item.amount},${securityAmount}\n`;
        });

        // Product analytics section
        if (data.productAnalytics?.length) {
            csv += `\nPRODUCT ANALYTICS\n`;
            csv += `Product Name,Total Revenue,Rental Count,Average per Rental\n`;
            data.productAnalytics.forEach(product => {
                csv += `"${product.productName}",${product.totalRental},${product.rentalCount},${(product.totalRental / product.rentalCount).toFixed(2)}\n`;
            });
        }

        return csv;
    }

    private formatDateForFile(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onDateRangeChange() {
        const form = this.reportForm;
        if (form.valid) {
            const startDate = form.get('startDate')?.value;
            const endDate = form.get('endDate')?.value;

            // Validate date range
            if (startDate && endDate && startDate > endDate) {
                this.toast.warn('Start date cannot be after end date');
                return;
            }

            // Auto-generate report if both dates are selected
            if (startDate && endDate) {
                this.loadReportData();
            }
        }
    }

    onResetDateRange() {
        this.reportForm.patchValue({
            startDate: this.getDefaultStartDate(),
            endDate: this.getDefaultEndDate()
        });

        // Clear current report data
        this.reportData.set(null);

        // Auto-load with default range
        this.loadReportData();
    }

    getCombinedChartData() {
        const data = this.reportData();
        if (!data) return null;

        return {
            labels: data.dailyRentalEarnings.map(item =>
                new Date(item.date).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric'
                })
            ),
            datasets: [
                {
                    label: 'Rental Earnings',
                    data: data.dailyRentalEarnings.map(item => item.amount),
                    borderColor: '#42A5F5',
                    backgroundColor: '#42A5F520',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Security Deposits',
                    data: data.dailySecurityEarnings.map(item => item.amount),
                    borderColor: '#66BB6A',
                    backgroundColor: '#66BB6A20',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                }
            ]
        };
    }

    getProductChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bar chart
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context: any) => {
                            const label = context.dataset.label;
                            const value = context.raw;
                            if (label.includes('Amount') || label.includes('Revenue')) {
                                return `${label}: ₹${value.toLocaleString()}`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    ticks: {
                        callback: (value: any) => {
                            return typeof value === 'number' && value > 999
                                ? '₹' + value.toLocaleString()
                                : value;
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Products'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };
    }

    getProductCombinedChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bar chart
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context: any) => {
                            const label = context.dataset.label;
                            const value = context.raw;
                            if (label.includes('Amount') || label.includes('Revenue')) {
                                return `${label}: ₹${value.toLocaleString()}`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Revenue (₹)'
                    },
                    position: 'bottom',
                    ticks: {
                        callback: (value: any) => '₹' + value.toLocaleString()
                    }
                },
                x1: {
                    type: 'linear',
                    display: true,
                    position: 'top',
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Products'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };
    }
}
