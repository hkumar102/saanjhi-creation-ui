import { Component, input, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

@Component({
  selector: 'saanjhi-ui-analytics-chart',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule],
  template: `
    <p-card [header]="title()">
      <p-chart 
        [type]="chartType()" 
        [data]="chartData()" 
        [options]="chartOptions()"
        [style]="{ height: chartHeight() }">
      </p-chart>
    </p-card>
  `
})
export class AnalyticsChartComponent implements OnInit {
  title = input.required<string>();
  chartType = input<'line' | 'bar' | 'pie' | 'doughnut'>('line');
  data = input.required<ChartData>();
  chartHeight = input<string>('300px');
  
  chartData = signal<any>({});
  chartOptions = signal<any>({});

  constructor() {
    effect(() => {
      this.updateChartData();
    });
  }

  ngOnInit() {
    this.setupChartOptions();
  }

  private updateChartData() {
    this.chartData.set(this.data());
  }

  private setupChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: this.chartType() !== 'pie' && this.chartType() !== 'doughnut' ? {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      } : {}
    });
  }
}