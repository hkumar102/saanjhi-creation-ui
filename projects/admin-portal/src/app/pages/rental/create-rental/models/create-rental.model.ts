import { AddressDto, CustomerDto, InventoryItemDto, ProductDto, RentalDto } from "@saanjhi-creation-ui/shared-common";

export interface RentalCreateCustomerModel {
    customer: CustomerDto | null, shippingAddress: AddressDto | null
}

export interface CreateRentalModel {
    customer: RentalCreateCustomerModel | null,
    rentalDetails: RentalDto | null,
    products: ProductDto[] | null,
    inventoryItems: InventoryItemDto[] | null
}