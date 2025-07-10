import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CurrencyConfigService } from '../services/currency-config.service';

@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class AppCurrencyPipe implements PipeTransform {
  private currencyPipe = inject(CurrencyPipe);
  private currencyConfig = inject(CurrencyConfigService);

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

    const settings = this.currencyConfig.getCurrencySettings();
    
    return this.currencyPipe.transform(
      value,
      currencyCode || settings.currencyCode,
      display || settings.display,
      digitsInfo || settings.digitsInfo,
      locale || settings.locale
    );
  }
}