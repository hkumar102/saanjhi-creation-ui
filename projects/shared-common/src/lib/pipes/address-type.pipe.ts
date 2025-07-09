import { Pipe, PipeTransform } from '@angular/core';
import { AddressType } from '../models';

@Pipe({
    name: 'addressTypeLabel',
    standalone: true,
})
export class AddressTypePipe implements PipeTransform {
    transform(value: AddressType | number | null | undefined): string {
        switch (value) {
            case AddressType.Shipping:
                return 'Shipping';
            case AddressType.Billing:
                return 'Billing';
            default:
                return 'Unknown';
        }
    }
}