import { Pipe, PipeTransform } from '@angular/core';
import { AddressDto, AddressType } from '../models';

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

// export a pipe address where we get AdddressDto and return the formatted address
@Pipe({
    name: 'addressFormat',
    standalone: true,
})
export class AddressFormatPipe implements PipeTransform {
    transform(address: AddressDto | null | undefined): string {
        if (!address) {
            return 'No address provided';
        }
        return `${address.line1}, ${address.line2}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country} - ${address.phoneNumber || ''}`;
    }
}