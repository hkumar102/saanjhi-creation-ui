export enum AddressType {
  Shipping = 0,
  Billing = 1
}

export interface AddressDto {
  id: string;
  customerId: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  type: AddressType;
}

export interface CustomerDto {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  addresses?: AddressDto[];
}

export interface CreateCustomerCommand {
  name?: string;
  email?: string;
  phoneNumber?: string;
  userId?: string;
}

export interface UpdateCustomerCommand {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  userId?: string;
}

export interface CreateAddressCommand {
  customerId: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  type: AddressType;
}

export interface UpdateAddressCommand {
  id: string;
  customerId: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  type: AddressType;
}