export enum AddressType {
  Shipping = 0,
  Billing = 1
}

export interface AddressDto {
  id: string;
  customerId: string;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  type: AddressType;
}

export interface CustomerDto {
  id: string;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  addresses?: AddressDto[] | null;
}

export interface CreateCustomerCommand {
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  userId?: string | null;
}

export interface UpdateCustomerCommand {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  userId?: string | null;
}

export interface CreateAddressCommand {
  customerId: string;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  type: AddressType;
}

export interface UpdateAddressCommand {
  id: string;
  customerId: string;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  type: AddressType;
}

// Query interfaces
export interface GetCustomersByIdsQuery {
  customerIds: string[];
}

export interface GetAddressesByIdsQuery {
  addressIds: string[];
}

export interface GetCustomersQuery {
  name?: string;
  email?: string;
  phoneNumber?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CustomerListModel extends CustomerDto {
  formattedAddress?: string;
}