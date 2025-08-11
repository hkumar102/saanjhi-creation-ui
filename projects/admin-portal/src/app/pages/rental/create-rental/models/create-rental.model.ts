import { AddressDto, CustomerDto, InventoryItemDto, ProductDto, RentalCreateModel, RentalDto } from "@saanjhi-creation-ui/shared-common";

export interface RentalCreateCustomerModel {
    customer: CustomerDto | null, shippingAddress: AddressDto | null
}

export interface CreateRentalModel {
    customer: RentalCreateCustomerModel | null,
    rentalDetails: RentalCreateModel | null,
    products: ProductDto[] | null,
    inventoryItems: InventoryItemDto[] | null
}