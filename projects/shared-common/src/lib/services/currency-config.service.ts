import { Injectable, LOCALE_ID, inject } from '@angular/core';

export interface CurrencySettings {
  currencyCode: string;
  display: 'symbol' | 'code' | 'symbol-narrow';
  digitsInfo: string;
  locale: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyConfigService {
  private localeId = inject(LOCALE_ID);

  private defaultSettings: CurrencySettings = {
    currencyCode: 'INR',
    display: 'symbol',
    digitsInfo: '1.0-0', // 1 minimum digit, 0 decimal places
    locale: 'en-IN'
  };

  private currencyMappings: Record<string, CurrencySettings> = {
    'en-IN': {
      currencyCode: 'INR',
      display: 'symbol',
      digitsInfo: '1.0-0',
      locale: 'en-IN'
    },
    'en-US': {
      currencyCode: 'USD',
      display: 'symbol',
      digitsInfo: '1.2-2',
      locale: 'en-US'
    },
    'en-GB': {
      currencyCode: 'GBP',
      display: 'symbol',
      digitsInfo: '1.2-2',
      locale: 'en-GB'
    }
  };

  getCurrencySettings(): CurrencySettings {
    return this.currencyMappings[this.localeId] || this.defaultSettings;
  }

  formatCurrency(value: number, customSettings?: Partial<CurrencySettings>): string {
    const settings = { ...this.getCurrencySettings(), ...customSettings };

    // This would be used in a custom pipe or service method
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currencyCode,
      minimumFractionDigits: this.getMinDigits(settings.digitsInfo),
      maximumFractionDigits: this.getMaxDigits(settings.digitsInfo)
    }).format(value);
  }

  private getMinDigits(digitsInfo: string): number {
    const parts = digitsInfo.split('.');
    return parseInt(parts[1]?.split('-')[0] || '0');
  }

  private getMaxDigits(digitsInfo: string): number {
    const parts = digitsInfo.split('.');
    return parseInt(parts[1]?.split('-')[1] || '0');
  }
}