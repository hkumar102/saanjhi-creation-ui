import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';
import { formatCurrency } from '@angular/common';
import { CurrencyConfigService } from '../services/currency-config.service';

@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class AppCurrencyPipe implements PipeTransform {
  private currencyConfig = inject(CurrencyConfigService);
  private locale = inject(LOCALE_ID);

  transform(
    value: number | string | null | undefined,
    currencyCode?: string,
    display?: 'symbol' | 'code' | 'symbol-narrow',
    digitsInfo?: string,
    locale?: string
  ): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return null;
    }

    const settings = this.currencyConfig.getCurrencySettings();

    try {
      const formatted = formatCurrency(
        numValue,
        locale || this.locale || settings.locale || 'en-IN',
        currencyCode || settings.currencyCode || 'INR',
        display || settings.display || 'symbol',
        digitsInfo || settings.digitsInfo || '1.0-0'
      );

      // ✅ Fix: Replace 'INR' text with ₹ symbol if it appears
      return formatted.replace(/INR\s?/g, '₹');
    } catch (error) {
      console.error('Currency formatting error:', error);
      return numValue.toString();
    }
  }
}