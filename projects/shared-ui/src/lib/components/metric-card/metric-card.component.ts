import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'saanjhi-ui-metric-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card styleClass="h-full">
      <div class="flex align-items-center justify-content-between">
        <div>
          <div class="text-600 font-medium mb-2">{{ title() }}</div>
          <div class="text-2xl font-bold text-900">{{ value() }}</div>
          <div class="flex align-items-center mt-2" *ngIf="trend()">
            <i class="pi" 
               [class.pi-arrow-up]="isPositiveTrend()" 
               [class.pi-arrow-down]="!isPositiveTrend()"
               [class.text-green-500]="isPositiveTrend()" 
               [class.text-red-500]="!isPositiveTrend()"></i>
            <span class="text-sm font-medium ml-1"
                  [class.text-green-500]="isPositiveTrend()" 
                  [class.text-red-500]="!isPositiveTrend()">
              {{ trend() }}
            </span>
            <span class="text-500 text-sm ml-2">{{ trendPeriod() }}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="border-circle p-3" 
               [style.background]="iconBackground()"
               style="width: 3.5rem; height: 3.5rem; display: flex; align-items: center; justify-content: center;">
            <i [class]="icon()" class="text-xl" [style.color]="iconColor()"></i>
          </div>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class MetricCardComponent {
  title = input.required<string>();
  value = input.required<string | null>();
  trend = input<string>('');
  trendPeriod = input<string>('vs last month');
  icon = input.required<string>();
  iconColor = input<string>('#ffffff');
  iconBackground = input<string>('var(--primary-color)');

  isPositiveTrend(): boolean {
    const trendValue = this.trend();
    return trendValue.startsWith('+') || (!trendValue.startsWith('-') && !trendValue.startsWith('0'));
  }
}