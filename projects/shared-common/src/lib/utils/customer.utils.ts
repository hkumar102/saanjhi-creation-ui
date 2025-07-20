import { CustomerDto } from "../models";

export function getCustomerFormattedAddress(customer: CustomerDto): string {
    if (!customer || !customer.addresses || customer.addresses.length === 0) {
        return 'No address available';
    }

    const address = customer.addresses[0];
    const parts = [
        address.line1,
        address.line2,
        `${address.city}, ${address.state} ${address.postalCode}`,
        address.country,
        address.phoneNumber,
        //if there are multiple addresses, we will show like 2 other addresses available
        ...(customer.addresses.length > 1 ? [`and ${customer.addresses.length - 1} other.`] : [])
    ].filter(part => part).join(', ');

    return parts || 'No address available';
}