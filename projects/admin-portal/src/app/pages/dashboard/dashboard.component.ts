import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { MetricCardComponent } from '@saanjhi-creation-ui/shared-ui';
import { AnalyticsChartComponent } from '@saanjhi-creation-ui/shared-ui';
import { DashboardService } from './services/dashboard.service';
import { AppCurrencyPipe } from '@saanjhi-creation-ui/shared-common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        TableModule,
        TagModule,
        ChartModule,
        MetricCardComponent,
        AnalyticsChartComponent,
        AppCurrencyPipe
    ],
    template: `
    <!-- Dashboard Header -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold text-900 m-0">Dashboard</h1>
        <p class="text-600 mt-1">Welcome back! Here's what's happening with your rental business.</p>
      </div>
      <p-tag value="Live Data" severity="success" icon="pi pi-circle-fill" />
    </div>

    <!-- Key Metrics Row -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <saanjhi-ui-metric-card
          title="Total Revenue"
          [value]="dashboardService.metrics().totalRevenue.toString()"
          [trend]="dashboardService.metrics().revenueGrowth"
          trendPeriod="vs last month"
          icon="pi pi-dollar"
          iconBackground="#10B981"
          iconColor="#ffffff" />
      </div>
      
      <div class="col-12 md:col-6 lg:col-3">
        <saanjhi-ui-metric-card
          title="Active Rentals"
          [value]="dashboardService.metrics().totalRentals.toString()"
          [trend]="dashboardService.metrics().rentalGrowth"
          trendPeriod="vs last month"
          icon="pi pi-calendar"
          iconBackground="#3B82F6"
          iconColor="#ffffff" />
      </div>
      
      <div class="col-12 md:col-6 lg:col-3">
        <saanjhi-ui-metric-card
          title="Total Customers"
          [value]="dashboardService.metrics().activeCustomers.toString()"
          [trend]="dashboardService.metrics().customerGrowth"
          trendPeriod="vs last month"
          icon="pi pi-users"
          iconBackground="#8B5CF6"
          iconColor="#ffffff" />
      </div>
      
      <div class="col-12 md:col-6 lg:col-3">
        <saanjhi-ui-metric-card
          title="Available Products"
          [value]="dashboardService.metrics().availableProducts.toString()"
          [trend]="dashboardService.metrics().productGrowth"
          trendPeriod="vs last month"
          icon="pi pi-box"
          iconBackground="#F59E0B"
          iconColor="#ffffff" />
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid mb-4">
      <div class="col-12 lg:col-8">
        <saanjhi-ui-analytics-chart
          title="Revenue Trend (Last 6 Months)"
          chartType="line"
          [data]="dashboardService.revenueChart()"
          chartHeight="400px" />
      </div>
      
      <div class="col-12 lg:col-4">
        <p-card header="Top Performing Products">
          <div class="flex flex-column gap-3">
            <div *ngFor="let product of dashboardService.topProducts(); let i = index" 
                 class="flex align-items-center justify-content-between p-2 border-round hover:surface-hover cursor-pointer">
              <div class="flex align-items-center gap-3">
                <div class="border-circle bg-primary text-white flex align-items-center justify-content-center"
                     style="width: 2rem; height: 2rem; font-size: 0.8rem;">
                  {{ i + 1 }}
                </div>
                <div>
                  <div class="font-semibold">{{ product.name }}</div>
                  <small class="text-600">{{ product.rentals }} rentals</small>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-primary">{{ product.revenue | appCurrency }}</div>
              </div>
            </div>
          </div>
        </p-card>
      </div>
    </div>

    <!-- Data Tables Row -->
    <div class="grid">
      <div class="col-12 lg:col-6">
        <p-card header="Recent Rentals" styleClass="h-full">
          <p-table [value]="dashboardService.recentRentals()" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-rental>
              <tr>
                <td>
                  <div class="font-semibold">{{ rental.customer?.name }}</div>
                  <small class="text-600">{{ rental.customer?.email }}</small>
                </td>
                <td>{{ rental.product?.name }}</td>
                <td>{{ rental.rentalPrice | appCurrency }}</td>
                <td>
                  <p-tag [value]="getRentalStatus(rental)" 
                         [severity]="getStatusSeverity(rental)" />
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center text-600">No recent rentals</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
      
      <div class="col-12 lg:col-6">
        <p-card header="Upcoming Returns" styleClass="h-full">
          <p-table [value]="dashboardService.upcomingReturns()" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Return Date</th>
                <th>Days Left</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-rental>
              <tr>
                <td>
                  <div class="font-semibold">{{ rental.customer?.name }}</div>
                </td>
                <td>{{ rental.product?.name }}</td>
                <td>{{ rental.endDate | date: 'shortDate' }}</td>
                <td>
                  <p-tag [value]="getDaysUntilReturn(rental.endDate) + ' days'" 
                         [severity]="getReturnUrgency(rental.endDate)" />
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center text-600">No upcoming returns</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
    dashboardService = inject(DashboardService);

    async ngOnInit() {
        await this.dashboardService.loadDashboardData();
    }

    getRentalStatus(rental: any): string {
        const today = new Date();
        const startDate = new Date(rental.startDate);
        const endDate = new Date(rental.endDate);

        if (today < startDate) return 'Upcoming';
        if (today >= startDate && today <= endDate) return 'Active';
        if (today > endDate) return 'Completed';
        return 'Unknown';
    }

    getStatusSeverity(rental: any): 'success' | 'info' | 'warning' | 'danger' {
        const status = this.getRentalStatus(rental);
        switch (status) {
            case 'Active': return 'success';
            case 'Upcoming': return 'info';
            case 'Completed': return 'warning';
            default: return 'danger';
        }
    }

    getDaysUntilReturn(endDate: string): number {
        const today = new Date();
        const returnDate = new Date(endDate);
        const diffTime = returnDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getReturnUrgency(endDate: string): 'success' | 'warning' | 'danger' {
        const days = this.getDaysUntilReturn(endDate);
        if (days > 3) return 'success';
        if (days > 1) return 'warning';
        return 'danger';
    }
}