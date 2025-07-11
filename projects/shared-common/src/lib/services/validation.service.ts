import { Injectable, inject } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, map, catchError } from 'rxjs';
import { RentalServiceClient, ProductServiceClient } from '../clients';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private rentalClient = inject(RentalServiceClient);
  private productClient = inject(ProductServiceClient);

  // ✅ Date Validators
  static futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return inputDate < today ? { pastDate: { value: control.value } } : null;
    };
  }

  static dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      
      if (!startDate || !endDate) return null;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return { invalidDateRange: { startDate, endDate } };
      }
      
      // ✅ Business Rule: Maximum rental period (e.g., 30 days)
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        return { maxRentalPeriod: { days: diffDays, max: 30 } };
      }
      
      return null;
    };
  }

  static minimumRentalDurationValidator(minDays: number = 1): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      
      if (!startDate || !endDate) return null;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays < minDays ? { minRentalDuration: { days: diffDays, min: minDays } } : null;
    };
  }

  // ✅ Price Validators
  static priceValidator(min: number = 0, max: number = 1000000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const price = parseFloat(control.value);
      
      if (isNaN(price)) {
        return { invalidPrice: { value: control.value } };
      }
      
      if (price < min) {
        return { minPrice: { value: price, min } };
      }
      
      if (price > max) {
        return { maxPrice: { value: price, max } };
      }
      
      return null;
    };
  }

  static securityDepositValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rentalPrice = control.get('rentalPrice')?.value;
      const securityDeposit = control.get('securityDeposit')?.value;
      
      if (!rentalPrice || !securityDeposit) return null;
      
      const rental = parseFloat(rentalPrice);
      const deposit = parseFloat(securityDeposit);
      
      // ✅ Business Rule: Security deposit should be 10-200% of rental price
      if (deposit < rental * 0.1) {
        return { minSecurityDeposit: { deposit, min: rental * 0.1 } };
      }
      
      if (deposit > rental * 2) {
        return { maxSecurityDeposit: { deposit, max: rental * 2 } };
      }
      
      return null;
    };
  }

  // ✅ Async Validators for Business Logic
  productAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.parent) return of(null);
      
      const productId = control.get('productId')?.value;
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      
      if (!productId || !startDate || !endDate) return of(null);
      
      return this.rentalClient.checkProductAvailability({
        productId,
        startDate,
        endDate
      }).pipe(
        map(result => result.isAvailable ? null : { productNotAvailable: { productId, startDate, endDate } }),
        catchError(() => of(null))
      );
    };
  }

  customerCreditLimitValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.parent) return of(null);
      
      const customerId = control.get('customerId')?.value;
      const rentalPrice = control.get('rentalPrice')?.value;
      const securityDeposit = control.get('securityDeposit')?.value;
      
      if (!customerId || !rentalPrice) return of(null);
      
      const totalAmount = parseFloat(rentalPrice) + parseFloat(securityDeposit || 0);
      
      return this.rentalClient.checkCustomerCreditLimit({
        customerId,
        amount: totalAmount
      }).pipe(
        map(result => result.withinLimit ? null : { 
          creditLimitExceeded: { 
            customerId, 
            amount: totalAmount, 
            limit: result.creditLimit 
          } 
        }),
        catchError(() => of(null))
      );
    };
  }
}